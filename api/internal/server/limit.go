package server

import (
	"time"
)

type RateLimiterData struct {
	IP        string
	Remaining int       // Remaining requests in the current window
	Reset     time.Time // Time when the rate limit will reset
}

type RateLimiterConfig struct {
	Limit  int           // Maximum requests allowed in the window
	Window time.Duration // Duration of the rate limit window
}

type RateLimiter struct {
	data   map[string]RateLimiterData
	config RateLimiterConfig
}

func CreateRateLimiter(limit int, window time.Duration) RateLimiter {
	return RateLimiter{
		data: make(map[string]RateLimiterData),
		config: RateLimiterConfig{
			Limit:  limit,
			Window: window,
		},
	}
}

// Function to check if the request exceeds the rate limit
func CheckRateLimit(ip string, rateLimiter *RateLimiter) bool {
	data, exists := rateLimiter.data[ip]
	if !exists {
		// If no data exists for the IP, create a new entry
		data = RateLimiterData{
			IP:        ip,
			Remaining: rateLimiter.config.Limit, // Initial limit
			Reset:     time.Now().Add(rateLimiter.config.Window),
		}
		rateLimiter.data[ip] = data
		return true
	}
	if time.Now().After(data.Reset) {
		// Reset the rate limit if the window has expired
		data.Remaining = rateLimiter.config.Limit
		data.Reset = time.Now().Add(rateLimiter.config.Window)
		rateLimiter.data[ip] = data
		return true
	}
	if data.Remaining > 0 {
		data.Remaining--
		rateLimiter.data[ip] = data
		return true
	}
	return false
}
