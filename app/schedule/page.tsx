
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ScheduleContent } from "@/components/schedule-content"

export default function SchedulePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <ScheduleContent />
        </main>
      </div>
    </div>
  )
}
