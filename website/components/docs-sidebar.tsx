"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    title: "Getting Started",
    items: [
      { title: "Overview", href: "#overview" },
      { title: "Authentication", href: "#authentication" },
      { title: "Rate Limiting", href: "#rate-limiting" },
      { title: "Error Handling", href: "#error-handling" },
    ],
  },
  {
    title: "API Endpoints",
    items: [
      { title: "Health Check", href: "#ping" },
      { title: "Search Packages", href: "#search" },
      { title: "Search by Name", href: "#packagename" },
      { title: "Search by Identifier", href: "#packageidentifier" },
      { title: "Search by Publisher", href: "#publisher" },
    ],
  },
]

export function DocsSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("#overview")

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigation.flatMap((nav) => nav.items.map((item) => item.href))
      const scrollPosition = window.scrollY + 100 // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.querySelector(sections[i])
        if (section && section.getBoundingClientRect().top <= 100) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLinkClick = (href: string) => {
    setActiveSection(href)
    setIsOpen(false)

    // Smooth scroll to section
    const element = document.querySelector(href)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-50 md:hidden bg-background border shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 transform border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ScrollArea className="h-full py-6 px-4">
          <div className="space-y-6">
            {navigation.map((section) => (
              <div key={section.title}>
                <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleLinkClick(item.href)}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 hover:bg-muted/50",
                        activeSection === item.href
                          ? "bg-primary/10 font-medium text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
                {section !== navigation[navigation.length - 1] && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
