
"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { RemoteSupportContent } from "@/components/remote-support-content"

export default function RemoteSupportPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <RemoteSupportContent />
        </main>
      </div>
    </div>
  )
}
