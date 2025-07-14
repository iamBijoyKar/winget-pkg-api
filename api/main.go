package main

import (
	"context"
	"fmt"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/gin-contrib/cache"
	"github.com/gin-contrib/cache/persistence"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/iamBijoyKar/winget-pkg/api/internal/server"
	logs "github.com/iamBijoyKar/winget-pkg/api/internal/utils"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const baseURL = "api/v1"

type User struct {
	Email  string `bson:"email" json:"email"`
	ApiKey string `bson:"apiKey" json:"apiKey"`
}

func authMiddleware(coll *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(401, gin.H{"error": "API key is required"})
			c.Abort()
			return
		}

		result := coll.FindOne(context.TODO(), gin.H{"apiKey": apiKey})
		if result.Err() != nil {
			c.JSON(401, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func rateLimitMiddleware(rateLimiter *server.RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		ipv4 := c.ClientIP()

		// Get rate limit info for headers
		remaining, reset, limit := server.GetRateLimitInfo(ipv4, rateLimiter)

		// Add rate limit headers
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", reset.Unix()))

		if !server.CheckRateLimit(ipv4, rateLimiter) {
			c.Header("Retry-After", fmt.Sprintf("%d", int(time.Until(reset).Seconds())))
			c.JSON(429, gin.H{
				"error":       "Rate limit exceeded",
				"retry_after": int(time.Until(reset).Seconds()),
				"limit":       limit,
				"window":      rateLimiter.GetStats()["window"],
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		logs.PrintWarning("No .env file found, using default environment variables")
	}
	// Check if MONGODB_URL is set
	MONGODB_URL := os.Getenv("MONGODB_URL")
	if MONGODB_URL == "" {
		logs.PrintWarning("MONGODB_URL not set in .env, using default value")
		os.Exit(1)
	}
	// Connect to MongoDB
	client, err := mongo.Connect(options.Client().
		ApplyURI(MONGODB_URL))
	if err != nil {
		panic(err)
	}
	// close the connection when done
	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			panic(err)
		} else {
			logs.PrintInfo("MongoDB connection closed successfully")
		}
	}()

	// package collection, mongo connection pool
	pkgColl := client.Database("winget").Collection("packages")
	userColl := client.Database("winget").Collection("users")

	// default router with recovery and logger
	router := gin.New()
	router.Use(gin.Recovery())

	// authMiddleware checks for the API key in the request header
	router.Use(authMiddleware(userColl))

	router.Use(gzip.Gzip(gzip.DefaultCompression))

	// rateLimitMiddleware checks if the request exceeds the rate limit
	rateLimiter := server.CreateRateLimiter(20, time.Second) // 10 requests per second
	router.Use(rateLimitMiddleware(rateLimiter))

	// Graceful shutdown - stop rate limiter when server shuts down
	defer rateLimiter.Stop()

	// Add rate limit headers to successful responses
	router.Use(func(c *gin.Context) {
		c.Next()

		// Only add headers for successful responses
		if c.Writer.Status() >= 200 && c.Writer.Status() < 300 {
			ipv4 := c.ClientIP()
			remaining, _, limit := server.GetRateLimitInfo(ipv4, rateLimiter)

			// Add additional rate limit headers
			c.Header("X-RateLimit-Status", "active")
			c.Header("X-RateLimit-Usage", fmt.Sprintf("%d/%d", limit-remaining, limit))
			c.Header("X-RateLimit-Percentage", fmt.Sprintf("%.1f", float64(limit-remaining)/float64(limit)*100))
		}
	})

	// cache store
	store := persistence.NewInMemoryStore(time.Second)

	router.GET(baseURL+"/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Rate limit status endpoint
	router.GET(baseURL+"/rate-limit", func(c *gin.Context) {
		ipv4 := c.ClientIP()
		remaining, reset, limit := server.GetRateLimitInfo(ipv4, rateLimiter)

		c.JSON(200, gin.H{
			"ip": ipv4,
			"rate_limit": gin.H{
				"limit":      limit,
				"remaining":  remaining,
				"reset":      reset.Unix(),
				"reset_time": reset.Format(time.RFC3339),
			},
			"stats": rateLimiter.GetStats(),
		})
	})

	router.GET(baseURL+"/search", cache.CachePageAtomic(store, time.Minute*10, func(c *gin.Context) {
		query := c.Query("q")
		query = strings.TrimSpace(query)
		// logs.PrintDebug("Search query:", query)
		if query == "" {
			c.JSON(400, gin.H{"error": "Query parameter 'q' is required"})
			return
		}

		escapedQuery := regexp.QuoteMeta(query)
		// Use regex to search in multiple fields
		// This will search for the query in PackageName, Publisher, ShortDescription, and Author fields
		filter := gin.H{
			"$or": []gin.H{
				{"PackageName": gin.H{"$regex": escapedQuery, "$options": "i"}},
				{"Publisher": gin.H{"$regex": escapedQuery, "$options": "i"}},
				{"ShortDescription": gin.H{"$regex": escapedQuery, "$options": "i"}},
				{"Author": gin.H{"$regex": escapedQuery, "$options": "i"}},
			},
		}
		cursor, err := pkgColl.Find(context.TODO(), filter)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to search packages"})
			return
		}
		defer cursor.Close(context.TODO())

		var results []gin.H
		for cursor.Next(context.TODO()) {
			var pkg gin.H
			if err := cursor.Decode(&pkg); err != nil {
				c.JSON(500, gin.H{"error": "Failed to decode package"})
				return
			}
			results = append(results, pkg)
		}

		c.JSON(200, gin.H{"results": results})
	}))

	router.GET(baseURL+"/packagename", cache.CachePageAtomic(store, time.Minute*10, func(c *gin.Context) {
		id := c.Query("name")
		id = strings.TrimSpace(id)
		// logs.PrintDebug("Package name:", id)
		if id == "" {
			c.JSON(400, gin.H{"error": "Query parameter 'name' is required"})
			return
		}

		escapedName := regexp.QuoteMeta(id)
		filter := gin.H{
			"PackageName": gin.H{"$regex": escapedName, "$options": "i"},
		}
		cursor, err := pkgColl.Find(context.TODO(), filter)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to search packages"})
			return
		}
		defer cursor.Close(context.TODO())

		var results []gin.H
		for cursor.Next(context.TODO()) {
			var pkg gin.H
			if err := cursor.Decode(&pkg); err != nil {
				c.JSON(500, gin.H{"error": "Failed to decode package"})
				return
			}
			results = append(results, pkg)
		}

		c.JSON(200, gin.H{"results": results})
	}))

	router.GET(baseURL+"/packageidentifier", cache.CachePageAtomic(store, time.Minute*10, func(c *gin.Context) {
		identifier := c.Query("identifier")
		identifier = strings.TrimSpace(identifier)
		// logs.PrintDebug("Package identifier:", identifier)
		if identifier == "" {
			c.JSON(400, gin.H{"error": "Query parameter 'identifier' is required"})
			return
		}

		escapedIdentifier := regexp.QuoteMeta(identifier)
		filter := gin.H{
			"PackageIdentifier": gin.H{"$regex": escapedIdentifier, "$options": "i"},
		}
		cursor, err := pkgColl.Find(context.TODO(), filter)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to search packages"})
			return
		}
		defer cursor.Close(context.TODO())

		var results []gin.H
		for cursor.Next(context.TODO()) {
			var pkg gin.H
			if err := cursor.Decode(&pkg); err != nil {
				c.JSON(500, gin.H{"error": "Failed to decode package"})
				return
			}
			results = append(results, pkg)
		}

		c.JSON(200, gin.H{"results": results})
	}))

	router.GET(baseURL+"/publisher", cache.CachePageAtomic(store, time.Minute*10, func(c *gin.Context) {
		name := c.Query("publisher")
		name = strings.TrimSpace(name)
		// logs.PrintDebug("Package publisher:", name)
		if name == "" {
			c.JSON(400, gin.H{"error": "Query parameter 'publisher' is required"})
			return
		}

		escapedPublisher := regexp.QuoteMeta(name)
		filter := gin.H{
			"Publisher": gin.H{"$regex": escapedPublisher, "$options": "i"},
		}
		cursor, err := pkgColl.Find(context.TODO(), filter)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to search packages"})
			return
		}
		defer cursor.Close(context.TODO())

		var results []gin.H
		for cursor.Next(context.TODO()) {
			var pkg gin.H
			if err := cursor.Decode(&pkg); err != nil {
				c.JSON(500, gin.H{"error": "Failed to decode package"})
				return
			}
			results = append(results, pkg)
		}

		c.JSON(200, gin.H{"results": results})
	}))

	router.Run() // listen and serve on 0.0.0.0:8080
}
