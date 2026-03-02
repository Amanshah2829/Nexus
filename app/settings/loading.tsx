
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function Loading() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden h-full">
            <div className="p-6 border-b border-border bg-card/30">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-10 w-full max-w-lg" />
            </div>
            <div className="p-6">
                <div className="space-y-6 max-w-4xl mx-auto">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </main>
      </div>
    </div>
  )
}
