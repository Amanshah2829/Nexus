
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { NotificationsContent } from "@/components/notifications-content"

export default function NotificationsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <NotificationsContent />
        </main>
      </div>
    </div>
  )
}
