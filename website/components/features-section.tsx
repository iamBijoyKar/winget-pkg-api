"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Key, Gauge, Code, Globe, Layers } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Database,
    title: "MongoDB Integration",
    description: "Efficient package storage and retrieval with MongoDB database",
    badge: "Database",
  },
  {
    icon: Key,
    title: "API Key Authentication",
    description: "Secure access control with X-API-Key header authentication",
    badge: "Security",
  },
  {
    icon: Gauge,
    title: "Rate Limiting",
    description: "100 requests per second rate limiting for optimal performance",
    badge: "Performance",
  },
  {
    icon: Code,
    title: "RESTful Design",
    description: "Clean, intuitive REST API endpoints following best practices",
    badge: "Architecture",
  },
  {
    icon: Globe,
    title: "Cross-Platform",
    description: "Built with Go for excellent cross-platform compatibility",
    badge: "Compatibility",
  },
  {
    icon: Layers,
    title: "Middleware Stack",
    description: "Comprehensive middleware for auth, rate limiting, and logging",
    badge: "Infrastructure",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Developers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to integrate winget package search into your applications
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
