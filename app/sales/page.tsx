
"use client";

import SuperAdminDashboard from "@/components/super-admin-dashboard"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function SalesPage() {
  return (
     <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
            <SuperAdminDashboard />
        </main>
      </div>
    </div>
  )
}
