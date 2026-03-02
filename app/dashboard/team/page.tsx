import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { TeamContent } from "@/components/team-content"

export default function TeamPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto h-full">
          <TeamContent />
        </main>
      </div>
    </div>
  )
}
