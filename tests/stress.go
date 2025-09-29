package main

import (
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Configuration for the stress test
type Config struct {
	APIURL              string
	APIKey              string
	ConcurrentRequests  int
	TotalRequests       int
	DelayBetweenBatches time.Duration
	RequestTimeout      time.Duration
}

// Rate limit headers structure
type RateLimitHeaders struct {
	Limit            string `json:"limit"`
	Remaining        string `json:"remaining"`
	Reset            string `json:"reset"`
	Tier             string `json:"tier"`
	Endpoint         string `json:"endpoint"`
	Status           string `json:"status"`
	Usage            string `json:"usage"`
	Percentage       string `json:"percentage"`
	UpgradeSuggested string `json:"upgrade_suggested"`
}

// Request result structure
type RequestResult struct {
	RequestID        int
	StatusCode       int
	ResponseTime     time.Duration
	RateLimitHeaders RateLimitHeaders
	Error            error
	Success          bool
	RateLimited      bool
}

// Statistics tracking
type Stats struct {
	mu                  sync.Mutex
	TotalRequests       int
	SuccessfulRequests  int
	RateLimitedRequests int
	FailedRequests      int
	StartTime           time.Time
	EndTime             time.Time
	ResponseTimes       []time.Duration
	RateLimitHeaders    []RateLimitHeaders
}

// Update stats thread-safely
func (s *Stats) Update(result RequestResult) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.TotalRequests++
	s.ResponseTimes = append(s.ResponseTimes, result.ResponseTime)

	if result.Success {
		s.SuccessfulRequests++
	} else if result.RateLimited {
		s.RateLimitedRequests++
	} else {
		s.FailedRequests++
	}

	if result.RateLimitHeaders.Limit != "" {
		s.RateLimitHeaders = append(s.RateLimitHeaders, result.RateLimitHeaders)
	}
}

// Make a single HTTP request
func makeRequest(client *http.Client, config Config, requestID int) RequestResult {
	startTime := time.Now()

	// Create request
	req, err := http.NewRequest("GET", config.APIURL, nil)
	if err != nil {
		return RequestResult{
			RequestID: requestID,
			Error:     err,
			Success:   false,
		}
	}

	// Add headers
	req.Header.Set("X-API-Key", config.APIKey)
	req.Header.Set("User-Agent", fmt.Sprintf("GoStressTest-%d", requestID))

	// Make request
	resp, err := client.Do(req)
	if err != nil {
		return RequestResult{
			RequestID: requestID,
			Error:     err,
			Success:   false,
		}
	}
	defer resp.Body.Close()

	responseTime := time.Since(startTime)

	// Read response body
	// body, err := io.ReadAll(resp.Body)
	// if err != nil {
	// 	return RequestResult{
	// 		RequestID: requestID,
	// 		Error:     err,
	// 		Success:   false,
	// 	}
	// }

	// Extract rate limit headers
	rateLimitHeaders := RateLimitHeaders{
		Limit:            resp.Header.Get("X-RateLimit-Limit"),
		Remaining:        resp.Header.Get("X-RateLimit-Remaining"),
		Reset:            resp.Header.Get("X-RateLimit-Reset"),
		Tier:             resp.Header.Get("X-RateLimit-Tier"),
		Endpoint:         resp.Header.Get("X-RateLimit-Endpoint"),
		Status:           resp.Header.Get("X-RateLimit-Status"),
		Usage:            resp.Header.Get("X-RateLimit-Usage"),
		Percentage:       resp.Header.Get("X-RateLimit-Percentage"),
		UpgradeSuggested: resp.Header.Get("X-RateLimit-Upgrade-Suggested"),
	}

	// Determine result type
	var success, rateLimited bool
	if resp.StatusCode == 200 {
		success = true
	} else if resp.StatusCode == 429 {
		rateLimited = true
	}

	return RequestResult{
		RequestID:        requestID,
		StatusCode:       resp.StatusCode,
		ResponseTime:     responseTime,
		RateLimitHeaders: rateLimitHeaders,
		Success:          success,
		RateLimited:      rateLimited,
	}
}

// Make concurrent requests
func makeConcurrentRequests(client *http.Client, config Config, stats *Stats, startID, count int, wg *sync.WaitGroup) {
	defer wg.Done()

	// Create a channel to collect results
	resultChan := make(chan RequestResult, count)

	// Launch goroutines for concurrent requests
	for i := 0; i < count; i++ {
		go func(requestID int) {
			result := makeRequest(client, config, requestID)
			resultChan <- result
		}(startID + i)
	}

	// Collect results
	for i := 0; i < count; i++ {
		result := <-resultChan
		stats.Update(result)

		// Print result
		if result.Success {
			fmt.Printf("✅ Request %d: Success (%v) - Remaining: %s/%s\n",
				result.RequestID, result.ResponseTime,
				result.RateLimitHeaders.Remaining, result.RateLimitHeaders.Limit)
		} else if result.RateLimited {
			fmt.Printf("🚫 Request %d: Rate Limited (%v) - Remaining: %s/%s\n",
				result.RequestID, result.ResponseTime,
				result.RateLimitHeaders.Remaining, result.RateLimitHeaders.Limit)
		} else {
			fmt.Printf("❌ Request %d: Failed (%d) - %v\n",
				result.RequestID, result.StatusCode, result.ResponseTime)
		}
	}
}

// Print test results
func printResults(stats *Stats) {
	stats.mu.Lock()
	defer stats.mu.Unlock()

	duration := stats.EndTime.Sub(stats.StartTime)

	// Calculate average response time
	var totalResponseTime time.Duration
	for _, rt := range stats.ResponseTimes {
		totalResponseTime += rt
	}
	avgResponseTime := time.Duration(0)
	if len(stats.ResponseTimes) > 0 {
		avgResponseTime = totalResponseTime / time.Duration(len(stats.ResponseTimes))
	}

	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Println("📊 STRESS TEST RESULTS")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("Total Duration: %v (%.2fs)\n", duration, duration.Seconds())
	fmt.Printf("Total Requests: %d\n", stats.TotalRequests)
	fmt.Printf("Successful: %d (%.1f%%)\n", stats.SuccessfulRequests, float64(stats.SuccessfulRequests)/float64(stats.TotalRequests)*100)
	fmt.Printf("Rate Limited: %d (%.1f%%)\n", stats.RateLimitedRequests, float64(stats.RateLimitedRequests)/float64(stats.TotalRequests)*100)
	fmt.Printf("Failed: %d (%.1f%%)\n", stats.FailedRequests, float64(stats.FailedRequests)/float64(stats.TotalRequests)*100)
	fmt.Printf("Average Response Time: %v\n", avgResponseTime)
	fmt.Printf("Requests per Second: %.2f\n", float64(stats.TotalRequests)/duration.Seconds())

	if len(stats.RateLimitHeaders) > 0 {
		fmt.Println("\n📈 RATE LIMIT HEADERS ANALYSIS")
		fmt.Println(strings.Repeat("-", 40))

		lastHeaders := stats.RateLimitHeaders[len(stats.RateLimitHeaders)-1]
		fmt.Printf("User Tier: %s\n", lastHeaders.Tier)
		fmt.Printf("Endpoint: %s\n", lastHeaders.Endpoint)
		fmt.Printf("Limit: %s\n", lastHeaders.Limit)
		fmt.Printf("Final Remaining: %s\n", lastHeaders.Remaining)
		fmt.Printf("Usage: %s\n", lastHeaders.Usage)
		fmt.Printf("Percentage: %s%%\n", lastHeaders.Percentage)

		if lastHeaders.UpgradeSuggested != "" {
			fmt.Printf("Upgrade Suggested: %s\n", lastHeaders.UpgradeSuggested)
		}
	}

	fmt.Println("\n🎯 RECOMMENDATIONS")
	fmt.Println(strings.Repeat("-", 40))
	if stats.RateLimitedRequests > 0 {
		fmt.Println("✅ Rate limiting is working correctly!")
		fmt.Printf("   %d requests were rate limited as expected.\n", stats.RateLimitedRequests)
	} else {
		fmt.Println("⚠️  No requests were rate limited. Consider:")
		fmt.Println("   - Increasing the number of concurrent requests")
		fmt.Println("   - Reducing the delay between batches")
		fmt.Println("   - Checking if rate limiting is properly configured")
	}

	if stats.FailedRequests > 0 {
		fmt.Printf("⚠️  %d requests failed. Check server logs for errors.\n", stats.FailedRequests)
	}

	fmt.Println(strings.Repeat("=", 60))
}

// Run the stress test
func runStressTest() {
	// Configuration
	config := Config{
		APIURL:              "https://winget-pkg-api.onrender.com/api/v1/packagename?name=Notion",
		APIKey:              "40ea24db0c5151114c0998c8a9019ff92934f30a3b88081706539c8dec2c025f",
		ConcurrentRequests:  50,
		TotalRequests:       200,
		DelayBetweenBatches: 1 * time.Second,
		RequestTimeout:      10 * time.Second,
	}

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: config.RequestTimeout,
		Transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 100,
			IdleConnTimeout:     90 * time.Second,
		},
	}

	// Initialize stats
	stats := &Stats{
		StartTime: time.Now(),
	}

	fmt.Println("🚀 Starting API Rate Limit Stress Test")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("API URL: %s\n", config.APIURL)
	fmt.Printf("Concurrent Requests: %d\n", config.ConcurrentRequests)
	fmt.Printf("Total Requests: %d\n", config.TotalRequests)
	fmt.Printf("Delay between batches: %v\n", config.DelayBetweenBatches)
	fmt.Println(strings.Repeat("=", 60))

	// Calculate batches
	batches := (config.TotalRequests + config.ConcurrentRequests - 1) / config.ConcurrentRequests

	var wg sync.WaitGroup

	for batch := 1; batch <= batches; batch++ {
		fmt.Printf("\n📦 Batch %d/%d\n", batch, batches)

		requestsInThisBatch := config.ConcurrentRequests
		if batch*config.ConcurrentRequests > config.TotalRequests {
			requestsInThisBatch = config.TotalRequests - (batch-1)*config.ConcurrentRequests
		}

		startID := (batch-1)*config.ConcurrentRequests + 1

		wg.Add(1)
		go makeConcurrentRequests(client, config, stats, startID, requestsInThisBatch, &wg)

		// Wait for current batch to complete
		wg.Wait()

		// Add delay between batches (except for the last batch)
		if batch < batches {
			fmt.Printf("⏳ Waiting %v before next batch...\n", config.DelayBetweenBatches)
			time.Sleep(config.DelayBetweenBatches)
		}
	}

	stats.EndTime = time.Now()
	printResults(stats)
}

func main() {
	runStressTest()
}
