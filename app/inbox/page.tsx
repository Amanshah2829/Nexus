
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { InboxContent } from "@/components/inbox-content"

export default function InboxPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 min-h-0 overflow-hidden">
          <InboxContent />
        </main>
      </div>
    </div>
  )
}
