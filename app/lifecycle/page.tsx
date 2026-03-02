
"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LifecycleContent } from "@/components/lifecycle-content"

export default function LifecyclePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <LifecycleContent />
        </main>
      </div>
    </div>
  )
}
