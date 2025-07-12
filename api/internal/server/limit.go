package server

import (
	"time"
)

type RateLimit struct {
	Limit     int           // Maximum number of requests allowed
	Window    time.Duration // Time window for the rate limit
	ResetTime time.Time     // Time when the rate limit resets
}

type RateLimiterData struct {
	IP        string
	Remaining int       // Remaining requests in the current window
	Reset     time.Time // Time when the rate limit will reset
}

func (rl *RateLimit) CreateRateLimiter() {
	rl.Limit = 5
	rl.Window = 1 * time.Minute
	rl.ResetTime = time.Now().Add(1 * time.Minute)
}

// map to store the rate limits for each IP address
var rateLimits = make(map[string]RateLimiterData)

// Function to check if the request exceeds the rate limit
func CheckRateLimit(ip string) bool {
	data, exists := rateLimits[ip]
	if !exists {
		// If no data exists for the IP, create a new entry
		data = RateLimiterData{
			IP:        ip,
			Remaining: 5, // Initial limit
			Reset:     time.Now().Add(1 * time.Minute),
		}
		rateLimits[ip] = data
		return true
	}
	if time.Now().After(data.Reset) {
		// Reset the rate limit if the window has expired
		data.Remaining = 5
		data.Reset = time.Now().Add(1 * time.Minute)
		rateLimits[ip] = data
		return true
	}
	if data.Remaining > 0 {
		data.Remaining--
		rateLimits[ip] = data
		return true
	}
	return false
}
