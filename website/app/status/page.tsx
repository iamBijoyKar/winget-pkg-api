import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ApiStatusChecker } from "@/components/api-status-checker"

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">API Status Monitor</h1>
            <p className="text-xl text-muted-foreground">
              Check the real-time operational status of the Winget Package API server
            </p>
          </div>
          <ApiStatusChecker />
        </div>
      </main>
      <Footer />
    </div>
  )
}
