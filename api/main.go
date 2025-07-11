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

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(401, gin.H{"error": "API key is required"})
			c.Abort()
			return
		}
		// Here you would typically validate the API key against your database
		// For now, we will just print it

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
	router.Use(authMiddleware())
	router.GET(baseURL+"/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	router.Run() // listen and serve on 0.0.0.0:8080
}
