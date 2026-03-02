

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { SettingsContent } from "@/components/settings-content"

export default function SupportPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {/* We can reuse the settings content with a specific tab */}
          <SettingsContent />
        </main>
      </div>
    </div>
  )
}
