
"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AssetVerificationContent } from "@/components/asset-verification-content"

export default function AssetVerificationPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <AssetVerificationContent />
        </main>
      </div>
    </div>
  )
}
