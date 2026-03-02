
"use client"

import { ReportContent } from "@/components/report-content"
import { Suspense } from "react"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function ReportPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><LoadingAnimation /></div>}>
            <ReportContent complaintId={params.id} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
