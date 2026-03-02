
import { Skeleton } from "@/components/ui/skeleton"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function Loading() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 md:p-8">
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-5 w-48 mt-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_320px] gap-6 px-4 sm:px-6 md:px-8 pb-8">
                <aside className="hidden md:block bg-card p-4 rounded-lg self-start sticky top-6">
                    <div className="space-y-4">
                        {[...Array(9)].map((_, i) => (
                           <div key={i} className="flex items-start">
                             <div className="flex flex-col items-center mr-4">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                {i < 8 && <Skeleton className="w-0.5 flex-1 mt-2 h-8" />}
                             </div>
                              <Skeleton className="h-6 w-24 mt-1" />
                           </div>
                        ))}
                    </div>
                </aside>
                <main>
                    <Skeleton className="h-96 w-full rounded-lg" />
                </main>
                 <aside className="hidden lg:block space-y-6 self-start sticky top-6">
                     <Skeleton className="h-40 w-full rounded-lg" />
                     <Skeleton className="h-24 w-full rounded-lg" />
                </aside>
            </div>
        </main>
      </div>
    </div>
  )
}
