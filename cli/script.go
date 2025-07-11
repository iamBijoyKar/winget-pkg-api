package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
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

func main() {
	if err := Execute(); err != nil {
		printError("Failed to execute command: %v", err)
		os.Exit(1)
	}
	printInfo("ccfmt started successfully")
}
