
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function Loading() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="grid md:grid-cols-[380px_1fr] h-full overflow-hidden">
            <div className="border-r border-border bg-card/30 flex-col flex">
                <div className="p-4 border-b border-border space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            </div>
             <div className="flex-1 flex-col hidden md:flex p-6 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
             </div>
        </main>
      </div>
    </div>
  )
}
