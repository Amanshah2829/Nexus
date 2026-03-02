
"use client"

import { OnVisitContent } from "@/components/on-visit-content"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"


// Wrap with Suspense to handle search param reading and initial data loading
export default function OnVisitPage() {
  return (
     <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <OnVisitContent />
        </main>
      </div>
    </div>
  )
}
