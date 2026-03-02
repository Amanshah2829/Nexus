
"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { EngineerContent } from "@/components/engineer-content"

export default function EngineerPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <EngineerContent />
        </main>
      </div>
    </div>
  )
}
