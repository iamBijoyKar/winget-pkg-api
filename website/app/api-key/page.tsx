import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ApiKeyRequestForm } from "@/components/api-key-request-form"

export default function ApiKeyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Request API Key</h1>
            <p className="text-xl text-muted-foreground">
              Get started with the Winget Package API by requesting your free API key
            </p>
          </div>
          <ApiKeyRequestForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
