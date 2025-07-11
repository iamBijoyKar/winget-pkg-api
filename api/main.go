package main

import (
	"context"
	"fmt"
	"os"

	// "time"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const baseURL = "api/v1"

// printError prints error messages in a consistent format
func printError(msg string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, "Error: "+msg+"\n", args...)
}

// printWarning prints warning messages in a consistent format
func printWarning(msg string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, "Warning: "+msg+"\n", args...)
}

// printInfo prints info messages in a consistent format
func printInfo(msg string, args ...interface{}) {
	fmt.Printf("Info: "+msg+"\n", args...)
}

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

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		printWarning("No .env file found, using default environment variables")
	}
	// Check if MONGODB_URL is set
	MONGODB_URL := os.Getenv("MONGODB_URL")
	if MONGODB_URL == "" {
		printWarning("MONGODB_URL not set in .env, using default value")
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
			printInfo("MongoDB connection closed successfully")
		}
	}()

	router := gin.Default()
	// authMiddleware checks for the API key in the request header
	router.Use(authMiddleware(client))

	router.GET(baseURL+"/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	router.GET(baseURL+"/search", func(c *gin.Context) {
		query := c.Query("q")
		fmt.Printf("Search query: %s\n", query)
		if query == "" {
			c.JSON(400, gin.H{"error": "Query parameter 'q' is required"})
			return
		}
		coll := client.Database("winget").Collection("packages")
		// filter := gin.H{"PackageName": gin.H{"$regex": query, "$options": "i"}}
		filter := gin.H{"name": "Universal Android Debloater GUI"}
		cursor, err := coll.Find(context.TODO(), filter)
		fmt.Printf("Filter: %v\n", filter)
		fmt.Printf("Cursor: %v\n", cursor)
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
	})
	router.Run() // listen and serve on 0.0.0.0:8080
}
