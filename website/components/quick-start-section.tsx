"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const codeExample = `curl -X GET "https://api.winget.dev/api/v1/search?q=vscode" \\
  -H "X-API-Key: your-api-key-here" \\
  -H "Content-Type: application/json"`

const responseExample = `{
  "results": [
    {
      "PackageIdentifier": "Microsoft.VisualStudioCode",
      "PackageName": "Visual Studio Code",
      "Publisher": "Microsoft Corporation",
      "ShortDescription": "Code editor redefined and optimized for building and debugging modern web and cloud applications.",
      "Author": "Microsoft"
    }
  ]
}`

export function QuickStartSection() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Start Guide</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get up and running with the Winget Package API in minutes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Example Request
                    <Badge variant="outline">cURL</Badge>
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(codeExample)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Search for packages using the search endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Example Response
                    <Badge variant="outline">JSON</Badge>
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(responseExample)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>JSON response with package information</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{responseExample}</code>
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Button asChild size="lg">
            <Link href="/api-key">
              Get Your API Key <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
