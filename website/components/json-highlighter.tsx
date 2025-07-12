"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface JsonHighlighterProps {
  data: any
  level?: number
  showCopyButton?: boolean
  compact?: boolean
  className?: string
}

export function JsonHighlighter({
  data,
  level = 0,
  showCopyButton = false,
  compact = false,
  className = "",
}: JsonHighlighterProps) {
  const [copied, setCopied] = useState(false)
  const indent = compact ? "  " : "    "
  const spacing = compact ? "" : " "

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, compact ? 2 : 4))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const getValueColor = (val: any) => {
    if (typeof val === "string") return "text-emerald-600 dark:text-emerald-400"
    if (typeof val === "number") return "text-blue-600 dark:text-blue-400"
    if (typeof val === "boolean") return "text-purple-600 dark:text-purple-400"
    if (val === null) return "text-gray-500 dark:text-gray-400"
    return "text-foreground"
  }

  const getKeyColor = () => "text-cyan-600 dark:text-cyan-400"
  const getBracketColor = () => "text-muted-foreground"
  const getPunctuationColor = () => "text-muted-foreground"

  const formatValue = (val: any) => {
    if (typeof val === "string") return `"${val}"`
    if (val === null) return "null"
    return String(val)
  }

  const renderValue = (key: string | number, value: any, isLast: boolean, currentLevel: number = level) => {
    const keyDisplay = typeof key === "string" ? `"${key}"` : key

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: currentLevel * 0.02 }}
        >
          <div className="flex">
            <span className={getKeyColor()}>{keyDisplay}</span>
            <span className={getPunctuationColor()}>:{spacing}</span>
            <span className={getBracketColor()}>{`{`}</span>
          </div>
          <div className="ml-4">
            {Object.entries(value).map(([k, v], index, array) =>
              renderValue(k, v, index === array.length - 1, currentLevel + 1),
            )}
          </div>
          <div className="flex">
            <span className={getBracketColor()}>{`}`}</span>
            {!isLast && <span className={getPunctuationColor()}>,</span>}
          </div>
        </motion.div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: currentLevel * 0.02 }}
        >
          <div className="flex">
            <span className={getKeyColor()}>{keyDisplay}</span>
            <span className={getPunctuationColor()}>:{spacing}</span>
            <span className={getBracketColor()}>[</span>
          </div>
          <div className="ml-4">
            {value.map((item, index) => (
              <div key={index}>
                {typeof item === "object" && item !== null ? (
                  <div>
                    <span className={getBracketColor()}>{`{`}</span>
                    <div className="ml-4">
                      {Object.entries(item).map(([k, v], idx, arr) =>
                        renderValue(k, v, idx === arr.length - 1, currentLevel + 2),
                      )}
                    </div>
                    <span className={getBracketColor()}>{`}`}</span>
                    {index < value.length - 1 && <span className={getPunctuationColor()}>,</span>}
                  </div>
                ) : (
                  <div className="flex">
                    <span className={getValueColor(item)}>{formatValue(item)}</span>
                    {index < value.length - 1 && <span className={getPunctuationColor()}>,</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex">
            <span className={getBracketColor()}>]</span>
            {!isLast && <span className={getPunctuationColor()}>,</span>}
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: currentLevel * 0.02 }}
        className="flex"
      >
        <span className={getKeyColor()}>{keyDisplay}</span>
        <span className={getPunctuationColor()}>:{spacing}</span>
        <span className={getValueColor(value)}>{formatValue(value)}</span>
        {!isLast && <span className={getPunctuationColor()}>,</span>}
      </motion.div>
    )
  }

  if (typeof data === "object" && data !== null) {
    // Ensure we're working with a properly serialized object
    const normalizedData = JSON.parse(JSON.stringify(data))

    return (
      <div className={`relative ${className}`}>
        {showCopyButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-70 hover:opacity-100"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
        <div className="font-mono text-sm leading-relaxed">
          <span className={getBracketColor()}>{`{`}</span>
          <div className="ml-4 space-y-0.5">
            {Object.entries(normalizedData).map(([key, value], index, array) =>
              renderValue(key, value, index === array.length - 1, 0),
            )}
          </div>
          <span className={getBracketColor()}>{`}`}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {showCopyButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-70 hover:opacity-100"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
      <pre className="font-mono text-sm leading-relaxed">
        <code className={getValueColor(data)}>{JSON.stringify(data, null, compact ? 2 : 4)}</code>
      </pre>
    </div>
  )
}

// Utility component for inline JSON snippets
export function InlineJsonHighlighter({ data, className = "" }: { data: any; className?: string }) {
  return (
    <code className={`font-mono text-sm px-1.5 py-0.5 rounded bg-muted ${className}`}>
      <span className="text-emerald-600 dark:text-emerald-400">
        {typeof data === "string" ? `"${data}"` : JSON.stringify(data)}
      </span>
    </code>
  )
}

// Component for code blocks with syntax highlighting
export function CodeBlock({
  code,
  language = "json",
  title,
  showCopyButton = true,
  className = "",
}: {
  code: string
  language?: string
  title?: string
  showCopyButton?: boolean
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const highlightJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      return <JsonHighlighter data={parsed} compact />
    } catch {
      return <pre className="font-mono text-sm leading-relaxed">{jsonString}</pre>
    }
  }

  const highlightCode = (codeString: string, lang: string) => {
    if (lang === "json") {
      return highlightJson(codeString)
    }

    // Basic syntax highlighting for other languages
    const lines = codeString.split("\n")
    return (
      <pre className="font-mono text-sm leading-relaxed">
        {lines.map((line, index) => (
          <div key={index}>
            {line.split(/(\s+|[{}[\]().,;:])/).map((part, partIndex) => {
              if (part.match(/^["'].*["']$/)) {
                return (
                  <span key={partIndex} className="text-emerald-600 dark:text-emerald-400">
                    {part}
                  </span>
                )
              }
              if (part.match(/^\d+$/)) {
                return (
                  <span key={partIndex} className="text-blue-600 dark:text-blue-400">
                    {part}
                  </span>
                )
              }
              if (part.match(/^(true|false|null)$/)) {
                return (
                  <span key={partIndex} className="text-purple-600 dark:text-purple-400">
                    {part}
                  </span>
                )
              }
              if (part.match(/^(curl|GET|POST|PUT|DELETE|HTTP)$/)) {
                return (
                  <span key={partIndex} className="text-orange-600 dark:text-orange-400 font-semibold">
                    {part}
                  </span>
                )
              }
              if (part.match(/^-[A-Za-z]/)) {
                return (
                  <span key={partIndex} className="text-cyan-600 dark:text-cyan-400">
                    {part}
                  </span>
                )
              }
              return (
                <span key={partIndex} className="text-foreground">
                  {part}
                </span>
              )
            })}
          </div>
        ))}
      </pre>
    )
  }

  return (
    <div className={`relative bg-muted/50 rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        </div>
      )}
      {showCopyButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-70 hover:opacity-100 z-10"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
      <div className="p-4 overflow-x-auto">{highlightCode(code, language)}</div>
    </div>
  )
}
