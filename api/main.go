package main

import (
	"context"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/gin-contrib/cache"
	"github.com/gin-contrib/cache/persistence"
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

func authMiddleware(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(401, gin.H{"error": "API key is required"})
			c.Abort()
			return
		}

		coll := client.Database("winget").Collection("users")
		result := coll.FindOne(context.TODO(), gin.H{"apiKey": apiKey})
		if result.Err() != nil {
			c.JSON(401, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func rateLimitMiddleware(rateLimiter server.RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		ipv4 := c.ClientIP()
		if !server.CheckRateLimit(ipv4, &rateLimiter) {
			c.JSON(429, gin.H{"error": "Rate limit exceeded"})
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

	// default router with recovery and logger
	router := gin.Default()

	// authMiddleware checks for the API key in the request header
	router.Use(authMiddleware(client))

	// rateLimitMiddleware checks if the request exceeds the rate limit
	rateLimiter := server.CreateRateLimiter(100, time.Second) // 100 requests per second
	router.Use(rateLimitMiddleware(rateLimiter))

	// cache store
	store := persistence.NewInMemoryStore(time.Second)

	router.GET(baseURL+"/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
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
		coll := client.Database("winget").Collection("packages")
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
		cursor, err := coll.Find(context.TODO(), filter)
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
		coll := client.Database("winget").Collection("packages")
		escapedName := regexp.QuoteMeta(id)
		filter := gin.H{
			"PackageName": gin.H{"$regex": escapedName, "$options": "i"},
		}
		cursor, err := coll.Find(context.TODO(), filter)
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
		coll := client.Database("winget").Collection("packages")
		escapedIdentifier := regexp.QuoteMeta(identifier)
		filter := gin.H{
			"PackageIdentifier": gin.H{"$regex": escapedIdentifier, "$options": "i"},
		}
		cursor, err := coll.Find(context.TODO(), filter)
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
		coll := client.Database("winget").Collection("packages")
		escapedPublisher := regexp.QuoteMeta(name)
		filter := gin.H{
			"Publisher": gin.H{"$regex": escapedPublisher, "$options": "i"},
		}
		cursor, err := coll.Find(context.TODO(), filter)
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
