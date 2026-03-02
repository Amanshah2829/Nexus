
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function Loading() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-10 w-full max-w-2xl"/>
            <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        </main>
      </div>
    </div>
  )
}
