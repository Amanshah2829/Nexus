
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ReportsContent } from "@/components/reports-content"

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <ReportsContent />
        </main>
      </div>
    </div>
  )
}
