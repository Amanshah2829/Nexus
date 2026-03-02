
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ComplaintsContent } from "@/components/complaints-content"

export default function ComplaintsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden h-full">
          <ComplaintsContent />
        </main>
      </div>
    </div>
  )
}
