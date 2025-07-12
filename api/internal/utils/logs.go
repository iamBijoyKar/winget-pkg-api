package logs

import (
	"fmt"
	"os"
)

// PrintError prints error messages in a consistent format
func PrintError(msg string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, "Error: "+msg+"\n", args...)
}

// PrintWarning prints warning messages in a consistent format
func PrintWarning(msg string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, "Warning: "+msg+"\n", args...)
}

// PrintInfo prints info messages in a consistent format
func PrintInfo(msg string, args ...interface{}) {
	fmt.Printf("Info: "+msg+"\n", args...)
}
