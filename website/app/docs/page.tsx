import { Header } from "@/components/header"
import { DocsSidebar } from "@/components/docs-sidebar"
import { DocsContent } from "@/components/docs-content"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1">
          <DocsContent />
        </main>
      </div>
    </div>
  )
}
