"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { 
  Search, Wrench, BookOpen, User, Calendar, 
  FileText, Copy, Check, Filter, Tag, 
  ArrowRight, ExternalLink, Share2, Printer,
  Sparkles, ThumbsUp, ThumbsDown, Eye, Terminal, Book
} from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/app/lib/utils"

import { ISolution } from "@/models/Solution"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function KnowledgeBaseContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const { data: solutions, error, isLoading } = useSWR<ISolution[]>(
    `/api/solutions?search=${searchQuery}`,
    fetcher
  )

  const categories = useMemo(() => {
    if (!solutions) return ["All"];
    const cats = new Set(solutions.map(s => s.category || "General"));
    return ["All", ...Array.from(cats)];
  }, [solutions]);

  const filteredSolutions = useMemo(() => {
    if (!solutions) return [];
    if (selectedCategory === "All") return solutions;
    return solutions.filter(s => (s.category || "General") === selectedCategory);
  }, [solutions, selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* 1. Unique Hero Header with Abstract Pattern */}
      <div className="relative border-b overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 animate-pulse" />
        
        <div className="px-6 py-12 md:py-16 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto relative z-10">
            <Badge variant="outline" className="py-1.5 px-4 text-sm border-primary/20 bg-primary/5 text-primary backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 mr-2 fill-primary/20" />
                Vynsec Intelligence Center
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              What can we help you solve?
            </h1>
            
            <div className="relative w-full max-w-2xl group transition-all duration-300 focus-within:scale-[1.02]">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex items-center bg-card border rounded-xl shadow-2xl">
                    <Search className="ml-4 h-6 w-6 text-muted-foreground" />
                    <Input
                        placeholder="Describe your issue (e.g., 'Router overheating' or 'Error 503')..."
                        className="pl-4 h-14 text-lg border-0 bg-transparent focus-visible:ring-0 shadow-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="hidden md:flex pr-2">
                        <Badge variant="secondary" className="mr-1">⌘K</Badge>
                    </div>
                </div>
            </div>
            
            {/* Quick Chips */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground mr-2">Popular:</span>
                {['Network Failure', 'Password Reset', 'VPN Config'].map(tag => (
                    <button 
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="text-xs px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-colors cursor-pointer"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:px-8 max-w-[1600px] mx-auto w-full space-y-8">
        
        {/* Advanced Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20 py-4 bg-background/80 backdrop-blur-xl border-b -mx-6 px-6 md:rounded-b-none">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            selectedCategory === cat 
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/50">
                 <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('grid')}
                >
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                        <div className="bg-current rounded-[1px]" />
                        <div className="bg-current rounded-[1px]" />
                        <div className="bg-current rounded-[1px]" />
                        <div className="bg-current rounded-[1px]" />
                    </div>
                 </Button>
                 <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('list')}
                >
                    <div className="flex flex-col gap-0.5 w-4 h-4 justify-center">
                        <div className="bg-current h-[2px] w-full rounded-full" />
                        <div className="bg-current h-[2px] w-full rounded-full" />
                        <div className="bg-current h-[2px] w-full rounded-full" />
                    </div>
                 </Button>
            </div>
        </div>

        {/* Content Grid */}
        <div className="min-h-[400px]">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <LoadingAnimation />
                    <p className="text-muted-foreground animate-pulse">Consulting the oracle...</p>
                </div>
            ) : filteredSolutions.length === 0 ? (
                <EmptyState />
            ) : (
                <div className={cn(
                    "grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700",
                    viewMode === 'grid' 
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                        : "grid-cols-1 max-w-4xl mx-auto"
                )}>
                    {filteredSolutions.map((solution, idx) => (
                        <SolutionCard key={solution._id} solution={solution} index={idx} viewMode={viewMode} />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
    return (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-card/50">
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No solutions found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">We couldn't find anything matching your search. Try broadening your terms.</p>
            <Button variant="outline">Clear Filters</Button>
        </div>
    )
}

// 2. Advanced Card Component with "Quick Preview" logic
function SolutionCard({ solution, index, viewMode }: { solution: ISolution, index: number, viewMode: 'grid' | 'list' }) {
    const isList = viewMode === 'list';
    
    // Calculate a "Helpfulness Score" (mock)
    const helpfulScore = useMemo(() => Math.floor(Math.random() * 50) + 80, []); 

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className={cn(
                    "group relative bg-card hover:bg-accent/5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                    "hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
                    isList ? "flex items-start gap-6 p-6" : "flex flex-col h-full"
                )}>
                    {/* Decorative Gradient Line */}
                    <div className={cn(
                        "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500",
                        isList && "w-1 h-full left-0 top-0 bg-gradient-to-b scale-y-0 group-hover:scale-y-100 scale-x-100"
                    )} />

                    <div className={cn("p-6 flex-1", isList && "p-0")}>
                        <div className="flex justify-between items-start gap-2 mb-4">
                            <Badge variant="secondary" className="rounded-md font-medium bg-secondary/50 text-secondary-foreground">
                                {solution.category || "General"}
                            </Badge>
                            <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {helpfulScore}%
                            </div>
                        </div>

                        <h3 className={cn(
                            "font-bold leading-tight group-hover:text-primary transition-colors mb-2",
                            isList ? "text-xl" : "text-lg line-clamp-2"
                        )}>
                            {solution.title}
                        </h3>

                        <p className={cn(
                            "text-muted-foreground text-sm",
                            isList ? "line-clamp-2 max-w-3xl" : "line-clamp-3"
                        )}>
                            {solution.description}
                        </p>
                        
                        {/* Smart AI Summary Tag (Mock) */}
                        <div className="mt-4 flex items-center gap-2 text-xs text-indigo-500 font-medium">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Summary: Quick fix available via CLI reset</span>
                        </div>
                    </div>

                    <div className={cn(
                        "p-4 border-t bg-muted/5 text-xs text-muted-foreground flex items-center justify-between",
                        isList && "border-t-0 border-l bg-transparent flex-col justify-center gap-2 p-0 pl-6 w-48"
                    )}>
                         <div className="flex items-center gap-2">
                             <Avatar className="h-6 w-6 ring-2 ring-background">
                                <AvatarImage src={`https://avatar.vercel.sh/${(solution.createdBy as any)?.name}.png`} />
                                <AvatarFallback>U</AvatarFallback>
                             </Avatar>
                             <span className="truncate max-w-[100px]">{(solution.createdBy as any)?.name}</span>
                         </div>
                         <div className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" />
                             <span>{formatDistanceToNow(new Date(solution.createdAt))} ago</span>
                         </div>
                    </div>
                </div>
            </SheetTrigger>
            
            <SolutionDetailSheet solution={solution} />
        </Sheet>
    )
}

// 3. Interactive Sheet with "Developer Mode"
function SolutionDetailSheet({ solution }: { solution: ISolution }) {
    const { toast } = useToast()
    const [copied, setCopied] = useState(false)
    const [devMode, setDevMode] = useState(false) // Toggle between Reader/Dev mode

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast({ description: "Resolution copied to clipboard" })
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <SheetContent className="sm:max-w-3xl w-full flex flex-col h-full overflow-hidden p-0 gap-0 border-l shadow-2xl">
            {/* Immersive Header */}
            <div className="relative bg-muted/30 p-8 pb-12 border-b shrink-0">
                <div className="absolute top-4 right-14 flex items-center gap-2">
                     <Button 
                        variant={devMode ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setDevMode(!devMode)}
                        className="gap-2 text-xs h-8"
                    >
                        {devMode ? <Book className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                        {devMode ? "Reader View" : "Dev Mode"}
                     </Button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-blue-600 hover:bg-blue-700">{solution.category}</Badge>
                    <Badge variant="outline" className="bg-background/50 backdrop-blur">
                        Ticket #{(solution.complaintId as any)?.id?.slice(-4) || 'NULL'}
                    </Badge>
                </div>
                <SheetTitle className="text-3xl font-bold leading-tight">{solution.title}</SheetTitle>
                
                {/* Author Pill */}
                <div className="absolute -bottom-5 left-8 flex items-center gap-3 bg-card p-2 pr-4 rounded-full border shadow-sm">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${(solution.createdBy as any)?.name}.png`} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-xs">
                        <span className="font-semibold">{(solution.createdBy as any)?.name}</span>
                        <span className="text-muted-foreground">Technical Lead</span>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-background/50">
                <div className="p-8 pt-10 space-y-8 max-w-3xl mx-auto">
                    
                    {/* The Problem (Context) */}
                    <div className="prose dark:prose-invert max-w-none">
                         <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                             <div className="w-1 h-6 bg-red-500 rounded-full" />
                             Context & Diagnosis
                         </h3>
                         <div className="bg-red-50/50 dark:bg-red-950/10 p-5 rounded-xl border border-red-100 dark:border-red-900/20 text-sm leading-relaxed text-muted-foreground mt-4">
                            {solution.description}
                         </div>
                    </div>

                    <Separator className="my-6" />

                    {/* The Solution (Interactive) */}
                    <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                                <div className="w-1 h-6 bg-green-500 rounded-full" />
                                Resolution
                            </h3>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-2 hover:bg-muted"
                                onClick={() => handleCopy(solution.resolution)}
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                            </Button>
                         </div>
                         
                         <div className={cn(
                             "relative rounded-xl border shadow-sm overflow-hidden transition-all",
                             devMode ? "bg-slate-950 border-slate-800" : "bg-card border-border"
                         )}>
                            {/* Mac-style Window Controls for Dev Mode */}
                            {devMode && (
                                <div className="flex items-center gap-1.5 p-3 border-b border-slate-800 bg-slate-900/50">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                    <div className="ml-auto text-xs text-slate-500 font-mono">bash</div>
                                </div>
                            )}

                            <div className={cn(
                                "p-6 text-sm leading-7 whitespace-pre-wrap font-mono overflow-x-auto",
                                devMode ? "text-green-400" : "text-foreground"
                            )}>
                                {solution.resolution}
                            </div>
                         </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="bg-muted/30 rounded-2xl p-6 text-center space-y-3 mt-12">
                        <p className="text-sm font-medium text-muted-foreground">Did this solve your issue?</p>
                        <div className="flex justify-center gap-3">
                            <Button variant="outline" className="gap-2 rounded-full hover:bg-green-500/10 hover:text-green-600 hover:border-green-200">
                                <ThumbsUp className="h-4 w-4" /> Yes, it worked
                            </Button>
                            <Button variant="outline" className="gap-2 rounded-full hover:bg-red-500/10 hover:text-red-600 hover:border-red-200">
                                <ThumbsDown className="h-4 w-4" /> No, still broken
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <SheetFooter className="p-4 border-t bg-background shrink-0 flex-row justify-between items-center">
                 <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 1,204 views</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> 45 shares</span>
                 </div>
                 <Button className="gap-2" variant="default">
                    <ExternalLink className="h-4 w-4" /> Open Original Ticket
                 </Button>
            </SheetFooter>
        </SheetContent>
    )
}
