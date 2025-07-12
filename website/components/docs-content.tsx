"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

const endpoints = [
  {
    id: "ping",
    method: "GET",
    path: "/api/v1/ping",
    title: "Health Check",
    description: "Check if the API is running and accessible",
    parameters: [],
    response: {
      success: `{
  "message": "pong"
}`,
      error: `{
  "error": "Invalid API key"
}`,
    },
  },
  {
    id: "search",
    method: "GET",
    path: "/api/v1/search",
    title: "Search Packages",
    description: "Search for packages across multiple fields including name, publisher, description, and author",
    parameters: [{ name: "q", type: "string", required: true, description: "Search query string" }],
    response: {
      success: `{
  "results": [
    {
      "PackageIdentifier": "Microsoft.VisualStudioCode",
      "PackageName": "Visual Studio Code",
      "Publisher": "Microsoft Corporation",
      "ShortDescription": "Code editor redefined and optimized...",
      "Author": "Microsoft"
    }
  ]
}`,
      error: `{
  "error": "Query parameter 'q' is required"
}`,
    },
  },
  {
    id: "packagename",
    method: "GET",
    path: "/api/v1/packagename",
    title: "Search by Package Name",
    description: "Search for packages by their package name",
    parameters: [{ name: "name", type: "string", required: true, description: "Package name to search for" }],
    response: {
      success: `{
  "results": [
    {
      "PackageIdentifier": "Microsoft.VisualStudioCode",
      "PackageName": "Visual Studio Code",
      "Publisher": "Microsoft Corporation",
      "ShortDescription": "Code editor redefined and optimized...",
      "Author": "Microsoft"
    }
  ]
}`,
      error: `{
  "error": "Query parameter 'name' is required"
}`,
    },
  },
  {
    id: "packageidentifier",
    method: "GET",
    path: "/api/v1/packageidentifier",
    title: "Search by Package Identifier",
    description: "Search for packages by their unique package identifier",
    parameters: [
      { name: "identifier", type: "string", required: true, description: "Package identifier to search for" },
    ],
    response: {
      success: `{
  "results": [
    {
      "PackageIdentifier": "Microsoft.VisualStudioCode",
      "PackageName": "Visual Studio Code",
      "Publisher": "Microsoft Corporation",
      "ShortDescription": "Code editor redefined and optimized...",
      "Author": "Microsoft"
    }
  ]
}`,
      error: `{
  "error": "Query parameter 'identifier' is required"
}`,
    },
  },
  {
    id: "publisher",
    method: "GET",
    path: "/api/v1/publisher",
    title: "Search by Publisher",
    description: "Search for packages by their publisher name",
    parameters: [{ name: "publisher", type: "string", required: true, description: "Publisher name to search for" }],
    response: {
      success: `{
  "results": [
    {
      "PackageIdentifier": "Microsoft.VisualStudioCode",
      "PackageName": "Visual Studio Code",
      "Publisher": "Microsoft Corporation",
      "ShortDescription": "Code editor redefined and optimized...",
      "Author": "Microsoft"
    }
  ]
}`,
      error: `{
  "error": "Query parameter 'publisher' is required"
}`,
    },
  },
]

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

export function DocsContent() {
  return (
    <div className="md:ml-64 min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Overview Section */}
        <motion.section
          id="overview"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
          <p className="text-xl text-muted-foreground mb-6">
            The Winget Package API provides fast and reliable access to Windows Package Manager package information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm bg-muted px-2 py-1 rounded">https://api.winget.dev</code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Version</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">v1</Badge>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Authentication Section */}
        <motion.section
          id="authentication"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Authentication</h2>
          <p className="text-muted-foreground mb-6">
            All API requests require authentication using an API key passed in the request header.
          </p>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Include your API key in the <code>X-API-Key</code> header for all requests.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Example Request Header</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>X-API-Key: your-api-key-here</code>
              </pre>
            </CardContent>
          </Card>
        </motion.section>

        {/* Rate Limiting Section */}
        <motion.section
          id="rate-limiting"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Rate Limiting</h2>
          <p className="text-muted-foreground mb-6">
            The API implements rate limiting to ensure fair usage and optimal performance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rate Limit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">100</div>
                <div className="text-sm text-muted-foreground">requests per second</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Error Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">429</div>
                <div className="text-sm text-muted-foreground">Too Many Requests</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">By IP Address</div>
                <div className="text-sm text-muted-foreground">Per client tracking</div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Error Handling Section */}
        <motion.section
          id="error-handling"
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Error Handling</h2>
          <p className="text-muted-foreground mb-6">
            The API uses conventional HTTP response codes to indicate success or failure.
          </p>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  200 - Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Request completed successfully</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  400 - Bad Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Missing or invalid parameters</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  401 - Unauthorized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Invalid or missing API key</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  429 - Too Many Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Rate limit exceeded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  500 - Internal Server Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Server error occurred</p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* API Endpoints */}
        <div className="space-y-16">
          {endpoints.map((endpoint, index) => (
            <motion.section
              key={endpoint.id}
              id={endpoint.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>{endpoint.method}</Badge>
                <code className="text-lg font-mono">{endpoint.path}</code>
              </div>

              <h2 className="text-3xl font-bold mb-2">{endpoint.title}</h2>
              <p className="text-muted-foreground mb-6">{endpoint.description}</p>

              {/* Parameters */}
              {endpoint.parameters.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {endpoint.parameters.map((param) => (
                        <div key={param.name} className="border-l-2 border-primary pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="font-mono text-sm">{param.name}</code>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Example Request */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Example Request</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          `curl -X ${endpoint.method} "https://api.winget.dev${endpoint.path}${endpoint.parameters.length > 0 ? "?" + endpoint.parameters.map((p) => `${p.name}=example`).join("&") : ""}" -H "X-API-Key: your-api-key-here"`,
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`curl -X ${endpoint.method} "https://api.winget.dev${endpoint.path}${endpoint.parameters.length > 0 ? "?" + endpoint.parameters.map((p) => `${p.name}=example`).join("&") : ""}" \\
  -H "X-API-Key: your-api-key-here"`}</code>
                  </pre>
                </CardContent>
              </Card>

              {/* Response Examples */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Success Response
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(endpoint.response.success)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{endpoint.response.success}</code>
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        Error Response
                      </CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(endpoint.response.error)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{endpoint.response.error}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  )
}
