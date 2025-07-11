package main

import "github.com/gin-gonic/gin"

const baseURL = "api/v1"

func main() {
	router := gin.Default()
	// Define a simple GET endpoint
	router.GET(baseURL+"/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	router.Run() // listen and serve on 0.0.0.0:8080
}
