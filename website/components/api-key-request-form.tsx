"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2, Mail, Key } from "lucide-react"
import { motion } from "framer-motion"

interface FormData {
  email: string
  projectType: string
  customProjectType: string
}

export function ApiKeyRequestForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    projectType: "",
    customProjectType: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.email) {
      newErrors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.projectType) {
      newErrors.projectType = "Please select a project type"
    }

    if (formData.projectType === "other" && !formData.customProjectType.trim()) {
      newErrors.customProjectType = "Please specify your project type"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (isSubmitted) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Request Submitted Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300 mt-2">
                  We've received your API key request. You'll receive an email with your API key and getting started
                  instructions within 24 hours.
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Next steps:</strong>
                  <br />
                  1. Check your email for the API key
                  <br />
                  2. Review our documentation to get started
                  <br />
                  3. Start building with the Winget Package API
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Request
          </CardTitle>
          <CardDescription>
            Fill out the form below to request your free API key. We'll review your request and send you the key via
            email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`pl-10 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            {/* Project Type Field */}
            <div className="space-y-2">
              <Label htmlFor="projectType" className="text-sm font-medium">
                What type of project are you going to build with the API? *
              </Label>
              <Select value={formData.projectType} onValueChange={(value) => handleInputChange("projectType", value)}>
                <SelectTrigger className={errors.projectType ? "border-red-500 focus:ring-red-500" : ""}>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Project</SelectItem>
                  <SelectItem value="commercial">Commercial Application</SelectItem>
                  <SelectItem value="educational">Educational Purpose</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.projectType && <p className="text-sm text-red-600 dark:text-red-400">{errors.projectType}</p>}
            </div>

            {/* Custom Project Type Field */}
            {formData.projectType === "other" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="customProjectType" className="text-sm font-medium">
                  Please specify your project type *
                </Label>
                <Textarea
                  id="customProjectType"
                  placeholder="Describe your project type..."
                  value={formData.customProjectType}
                  onChange={(e) => handleInputChange("customProjectType", e.target.value)}
                  className={`resize-none ${errors.customProjectType ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  rows={3}
                />
                {errors.customProjectType && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.customProjectType}</p>
                )}
              </motion.div>
            )}

            {/* Info Alert */}
            <Alert>
              <AlertDescription>
                <strong>Note:</strong> API keys are provided free of charge for legitimate use cases. We review all
                requests to ensure compliance with our terms of service.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                "Submit API Key Request"
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-2">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• We'll review your request within 24 hours</li>
              <li>• You'll receive an email with your API key and documentation</li>
              <li>• Start building immediately with 100 requests per second</li>
              <li>• Get support through our documentation and GitHub issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
