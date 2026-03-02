
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { KnowledgeBaseContent } from "@/components/knowledge-base-content"

export default function KnowledgeBasePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <KnowledgeBaseContent />
        </main>
      </div>
    </div>
  )
}
