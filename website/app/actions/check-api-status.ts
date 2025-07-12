"use server"

interface ApiResponse {
  success: boolean
  status: number
  data?: any
  error?: string
  responseTime: number
  timestamp: string
}

export async function checkApiStatus(): Promise<ApiResponse> {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch("https://winget-pkg-api.onrender.com/api/v1/ping", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Winget-API-Status-Checker/1.0",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        timestamp,
      }
    }

    const data = await response.json()

    return {
      success: true,
      status: response.status,
      data,
      responseTime,
      timestamp,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          status: 0,
          error: "Request timeout (10 seconds)",
          responseTime,
          timestamp,
        }
      }

      return {
        success: false,
        status: 0,
        error: error.message,
        responseTime,
        timestamp,
      }
    }

    return {
      success: false,
      status: 0,
      error: "Unknown error occurred",
      responseTime,
      timestamp,
    }
  }
}
