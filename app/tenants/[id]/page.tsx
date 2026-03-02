
"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { TenantDetailContent } from "@/components/tenant-detail-content"

export default function TenantDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <TenantDetailContent tenantId={params.id} onBack={() => window.history.back()} />
        </main>
      </div>
    </div>
  )
}
