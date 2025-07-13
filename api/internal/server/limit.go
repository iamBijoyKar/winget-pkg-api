package server

import (
	"sync"
	"time"
)

type RateLimiterData struct {
	IP        string
	Remaining int       // Remaining requests in the current window
	Reset     time.Time // Time when the rate limit will reset
	LastSeen  time.Time // Last time this IP made a request
}

type RateLimiterConfig struct {
	Limit           int           // Maximum requests allowed in the window
	Window          time.Duration // Duration of the rate limit window
	CleanupInterval time.Duration // How often to clean up old entries
}

type RateLimiter struct {
	data   map[string]RateLimiterData
	config RateLimiterConfig
	mutex  sync.RWMutex
	stop   chan struct{}
}

func CreateRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		data: make(map[string]RateLimiterData),
		config: RateLimiterConfig{
			Limit:           limit,
			Window:          window,
			CleanupInterval: window * 2, // Clean up entries older than 2 windows
		},
		stop: make(chan struct{}),
	}

	// Start cleanup goroutine
	go rl.cleanupRoutine()

	return rl
}

// Stop the rate limiter and cleanup goroutine
func (rl *RateLimiter) Stop() {
	close(rl.stop)
}

// Cleanup routine to remove old entries
func (rl *RateLimiter) cleanupRoutine() {
	ticker := time.NewTicker(rl.config.CleanupInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rl.cleanup()
		case <-rl.stop:
			return
		}
	}
}

// Remove old entries to prevent memory leaks
func (rl *RateLimiter) cleanup() {
	rl.mutex.Lock()
	defer rl.mutex.Unlock()

	cutoff := time.Now().Add(-rl.config.CleanupInterval)
	for ip, data := range rl.data {
		if data.LastSeen.Before(cutoff) {
			delete(rl.data, ip)
		}
	}
}

// Function to check if the request exceeds the rate limit
func CheckRateLimit(ip string, rateLimiter *RateLimiter) bool {
	rateLimiter.mutex.Lock()
	defer rateLimiter.mutex.Unlock()

	now := time.Now()
	data, exists := rateLimiter.data[ip]

	if !exists {
		// If no data exists for the IP, create a new entry
		data = RateLimiterData{
			IP:        ip,
			Remaining: rateLimiter.config.Limit - 1, // Subtract 1 for current request
			Reset:     now.Add(rateLimiter.config.Window),
			LastSeen:  now,
		}
		rateLimiter.data[ip] = data
		return true
	}

	// Update last seen time
	data.LastSeen = now

	// Check if the window has expired
	if now.After(data.Reset) {
		// Reset the rate limit if the window has expired
		data.Remaining = rateLimiter.config.Limit - 1 // Subtract 1 for current request
		data.Reset = now.Add(rateLimiter.config.Window)
		rateLimiter.data[ip] = data
		return true
	}

	// Check if there are remaining requests
	if data.Remaining > 0 {
		data.Remaining--
		rateLimiter.data[ip] = data
		return true
	}

	// Rate limit exceeded, update the data but don't allow the request
	rateLimiter.data[ip] = data
	return false
}

// Get rate limit information for an IP (useful for headers)
func GetRateLimitInfo(ip string, rateLimiter *RateLimiter) (remaining int, reset time.Time, limit int) {
	rateLimiter.mutex.RLock()
	defer rateLimiter.mutex.RUnlock()

	data, exists := rateLimiter.data[ip]
	if !exists {
		return rateLimiter.config.Limit, time.Now().Add(rateLimiter.config.Window), rateLimiter.config.Limit
	}

	// Check if window has expired
	if time.Now().After(data.Reset) {
		return rateLimiter.config.Limit, time.Now().Add(rateLimiter.config.Window), rateLimiter.config.Limit
	}

	return data.Remaining, data.Reset, rateLimiter.config.Limit
}

// Get current statistics about the rate limiter
func (rl *RateLimiter) GetStats() map[string]interface{} {
	rl.mutex.RLock()
	defer rl.mutex.RUnlock()

	return map[string]interface{}{
		"active_ips":       len(rl.data),
		"limit":            rl.config.Limit,
		"window":           rl.config.Window.String(),
		"cleanup_interval": rl.config.CleanupInterval.String(),
	}
}
