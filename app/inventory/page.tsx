
"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { InventoryContent } from "@/components/inventory-content"

export default function InventoryPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <InventoryContent />
        </main>
      </div>
    </div>
  )
}
