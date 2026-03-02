import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { TicketsContent } from "@/components/tickets-content"

export default function TicketsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto h-full">
          <TicketsContent />
        </main>
      </div>
    </div>
  )
}
