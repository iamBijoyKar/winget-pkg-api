"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, RefreshCw, Clock, Server, Zap, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { checkApiStatus } from "@/app/actions/check-api-status"
import { JsonHighlighter } from "@/components/json-highlighter"

interface ApiResponse {
  success: boolean
  status: number
  data?: any
  error?: string
  responseTime: number
  timestamp: string
}

export function ApiStatusChecker() {
  const [status, setStatus] = useState<ApiResponse | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCheckStatus = () => {
    startTransition(async () => {
      const result = await checkApiStatus()
      setStatus(result)
    })
  }

  const getStatusColor = () => {
    if (!status) return "muted"
    if (status.success) return "success"
    return "destructive"
  }

  const getStatusIcon = () => {
    if (isPending) return <Loader2 className="h-5 w-5 animate-spin" />
    if (!status) return <Server className="h-5 w-5" />
    if (status.success) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusText = () => {
    if (isPending) return "Checking..."
    if (!status) return "Ready to check"
    if (status.success) return "API is operational"
    return "API is not responding"
  }

  const getResponseTimeColor = () => {
    if (!status?.responseTime) return "muted"
    if (status.responseTime < 500) return "success"
    if (status.responseTime < 2000) return "warning"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      {/* Status Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            API Status Check
          </CardTitle>
          <CardDescription>Monitor the health and performance of the Winget Package API endpoint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  getStatusColor() === "success"
                    ? "default"
                    : getStatusColor() === "destructive"
                      ? "destructive"
                      : "secondary"
                }
                className="text-sm"
              >
                {getStatusText()}
              </Badge>
              {status && (
                <span className="text-sm text-muted-foreground">
                  Last checked: {new Date(status.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            <Button onClick={handleCheckStatus} disabled={isPending} className="min-w-[140px]">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Status
                </>
              )}
            </Button>
          </div>

          {/* Status Metrics */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div
                    className={`p-2 rounded-full ${
                      status.success ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                    }`}
                  >
                    {status.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status Code</p>
                    <p className="text-lg font-bold">{status.status || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div
                    className={`p-2 rounded-full ${
                      getResponseTimeColor() === "success"
                        ? "bg-green-100 dark:bg-green-900"
                        : getResponseTimeColor() === "warning"
                          ? "bg-yellow-100 dark:bg-yellow-900"
                          : "bg-red-100 dark:bg-red-900"
                    }`}
                  >
                    <Clock
                      className={`h-4 w-4 ${
                        getResponseTimeColor() === "success"
                          ? "text-green-600 dark:text-green-400"
                          : getResponseTimeColor() === "warning"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-lg font-bold">{status.responseTime}ms</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Endpoint</p>
                    <p className="text-sm font-mono">/api/v1/ping</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Error Alert */}
      <AnimatePresence>
        {status && !status.success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>API Error:</strong> {status.error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response Data Card */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  API Response
                </CardTitle>
                <CardDescription>Complete JSON response from the API endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <JsonHighlighter
                  data={status}
                  showCopyButton
                  className={`rounded-lg p-4 ${
                    status.success ? "bg-green-50 dark:bg-green-950/50" : "bg-red-50 dark:bg-red-950/50"
                  }`}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>About This Status Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Endpoint Details</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <strong>URL:</strong> https://winget-pkg-api.onrender.com/api/v1/ping
                </li>
                <li>
                  • <strong>Method:</strong> GET
                </li>
                <li>
                  • <strong>Timeout:</strong> 10 seconds
                </li>
                <li>
                  • <strong>Expected Response:</strong> JSON with{" "}
                  <code className="text-emerald-600 dark:text-emerald-400">"message": "pong"</code>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Status Indicators</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <span className="text-green-600">Green:</span> API is operational (200 OK)
                </li>
                <li>
                  • <span className="text-red-600">Red:</span> API is not responding or error
                </li>
                <li>
                  • <span className="text-yellow-600">Yellow:</span> Slow response ({">"} 500ms)
                </li>
                <li>• Response times {"<"} 500ms are considered optimal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
