
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function Loading() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            
            <Skeleton className="h-96 w-full" />
        </main>
      </div>
    </div>
  )
}
