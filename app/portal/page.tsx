
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { UserPortalContent } from "@/components/user-portal-content"

export default function UserPortalPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <UserPortalContent />
        </main>
      </div>
    </div>
  )
}
