package main

import (
	"context"
	"crypto/sha256"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var rootCmd = &cobra.Command{
	Use:   "ccfmt",
	Short: "A C/C++ code formatter written in Go",
	Long: `ccfmt is a fast and configurable C/C++ code formatter.
It supports formatting single files or entire directories recursively,
with configurable rules for indentation, brace placement, and spacing.`,
	Version: "1.0.0",
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() error {
	return rootCmd.Execute()
}

func init() {
	cobra.OnInitialize(initConfig)
}

func initConfig() {
	// Configuration is handled per command
}

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

func addUserToDatabase(client *mongo.Client, email string, salt string) error {
	coll := client.Database("winget").Collection("users")
	currentTime := time.Now().UTC()
	if email == "" {
		printError("Email cannot be empty")
		return fmt.Errorf("email cannot be empty")
	}
	newUser := User{
		Email:  email,
		ApiKey: fmt.Sprintf("%x", sha256.Sum256([]byte(email+salt+currentTime.Format(time.RFC3339)))),
	}

	result, err := coll.InsertOne(context.TODO(), newUser)
	if err != nil {
		printError("Failed to insert user: %v", err)
		panic(err)
	}
	fmt.Printf("Inserted user with ID: %v\n", result)
	return nil
}

func main() {
	if err := Execute(); err != nil {
		printError("Failed to execute command: %v", err)
		os.Exit(1)
	}

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
	// Check if SALT is set
	SALT := os.Getenv("SALT")
	if SALT == "" {
		printWarning("SALT not set in .env, using default value")
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

	if err := addUserToDatabase(client, "example12345@gmail.com", SALT); err != nil {
		printError("Failed to add user to database: %v", err)
		panic(err)
	}
}
