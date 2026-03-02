
"use client"

import { Suspense } from "react"
import { SettingsContent } from "@/components/settings-content"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LoadingAnimation } from "@/components/ui/loading-animation"

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
            <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingAnimation /></div>}>
                 <SettingsContent />
            </Suspense>
        </main>
      </div>
    </div>
  )
}
