
// app/components/inbox-content.tsx
"use client"

import React, { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import {
  Inbox,
  Send,
  FileText,
  Archive,
  Trash2,
  MoreVertical,
  Mail,
  Loader2,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronsRightLeft,
  Plus,
  Send as SendIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { CreateComplaintForm, fetcher } from "@/components/complaints-content"
import { cn } from "@/app/lib/utils"

type Mailbox = "inbox" | "sent" | "drafts" | "trash" | "archive"

const mailboxes: { id: Mailbox; name: string; icon: React.ElementType }[] = [
  { id: "inbox", name: "Inbox", icon: Inbox },
  { id: "sent", name: "Sent", icon: Send },
  { id: "drafts", name: "Drafts", icon: FileText },
  { id: "archive", name: "Archive", icon: Archive },
  { id: "trash", name: "Trash", icon: Trash2 },
]

export function InboxContent() {
  const [selectedMailbox, setSelectedMailbox] = useState<Mailbox>("inbox")
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [emailForTicket, setEmailForTicket] = useState<any>(null)

  const { toast } = useToast()

  const {
    data,
    error,
    isLoading,
    mutate: mutateEmails,
  } = useSWR(`/api/emails?mailbox=${selectedMailbox}`, fetcher, {
    revalidateOnFocus: false,
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not fetch emails",
        description: err.message,
      })
    },
  })
  const emails = (data?.emails || []) as any[]

  const {
    data: selectedEmail,
    isLoading: isLoadingSelectedEmail,
  } = useSWR(
    selectedEmailId
      ? `/api/emails?uid=${selectedEmailId}&mailbox=${selectedMailbox}`
      : null,
    fetcher
  )

  useEffect(() => {
    if (emails.length > 0 && !selectedEmailId && window.innerWidth >= 768) {
      setSelectedEmailId(emails[0].id)
    }
  }, [emails, selectedEmailId])

  const filteredEmails = searchQuery
    ? emails.filter((e) => {
        const q = searchQuery.toLowerCase()
        return (
          e.from?.toLowerCase().includes(q) ||
          e.subject?.toLowerCase().includes(q) ||
          e.text?.toLowerCase().includes(q)
        )
      })
    : emails

  const handleCreateTicketFromEmail = (email: any) => {
    setEmailForTicket(email)
    setIsCreateTicketOpen(true)
  }

  const handleCreateComplaint = async (formData: any) => {
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          originalEmailMessageId: emailForTicket?.messageId,
          originalEmailReferences: emailForTicket?.references,
        }),
      })

      if (!response.ok) throw new Error("Failed to create complaint")

      const newComplaint = await response.json()
      mutate("/api/complaints?status=all&search=")
      setIsCreateTicketOpen(false)
      setEmailForTicket(null)
      toast({
        title: "Ticket created",
        description: `Complaint ${newComplaint.id} has been created from this email.`,
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create ticket.",
      })
    }
  }

  return (
    <div
      className={cn(
        "grid h-full min-h-0 overflow-hidden",
        isSidebarCollapsed
          ? "md:grid-cols-[80px_360px_1fr]"
          : "md:grid-cols-[220px_380px_minmax(0,1fr)]"
      )}
    >
      {/* LEFT: mailbox sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card/50 backdrop-blur",
          isSidebarCollapsed && "items-center"
        )}
      >
        <div
          className={cn(
            "flex items-center h-14 px-4 border-b border-border",
            isSidebarCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isSidebarCollapsed && (
            <div className="space-y-0.5">
              <p className="font-semibold text-sm">Mail Center</p>
              <p className="text-[11px] text-muted-foreground">
                Linked support inbox
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed((x) => !x)}
          >
            <ChevronsRightLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-3 border-b border-border">
          <Button className="w-full justify-center gap-2 text-xs">
            <Plus className="h-4 w-4" />
            {!isSidebarCollapsed && "New Email"}
          </Button>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
          {mailboxes.map((mb) => (
            <Button
              key={mb.id}
              variant={selectedMailbox === mb.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-9 text-sm",
                isSidebarCollapsed && "justify-center w-10 px-0"
              )}
              onClick={() => {
                setSelectedMailbox(mb.id)
                setSelectedEmailId(null)
              }}
            >
              <mb.icon className="h-4 w-4" />
              {!isSidebarCollapsed && mb.name}
            </Button>
          ))}
        </nav>
        <div className="p-3 border-t border-border text-[11px] text-muted-foreground">
          {!isSidebarCollapsed && (
            <p>Linked to your complaint manager for ticket creation.</p>
          )}
        </div>
      </aside>

      {/* MIDDLE: email list */}
      <section
        className={cn(
          "border-r border-border bg-card/60 h-full flex flex-col min-h-0",
          selectedEmailId && "hidden md:flex"
        )}
      >
        <div className="h-14 px-4 border-b border-border flex items-center justify-between gap-2 shrink-0">
          <div>
            <p className="font-semibold text-sm capitalize">
              {selectedMailbox}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {emails.length} messages
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => mutateEmails()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="p-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading && !error && (
            <div className="p-6 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          )}
          {error && (
            <div className="p-6 text-center text-destructive text-sm">
              {(error as any).message}
            </div>
          )}
          {!isLoading &&
            filteredEmails.map((email) => (
              <button
                key={email.id}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border/60 hover:bg-accent/40 flex flex-col gap-1",
                  selectedEmailId === email.id && "bg-accent/60"
                )}
                onClick={() => setSelectedEmailId(email.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-xs truncate max-w-[65%]">
                    {email.from}
                  </p>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(email.date).toLocaleDateString()}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-xs truncate",
                    !email.seen && "font-semibold"
                  )}
                >
                  {email.subject || "(no subject)"}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {email.text}
                </p>
              </button>
            ))}
          {!isLoading && filteredEmails.length === 0 && !error && (
            <div className="p-6 text-xs text-muted-foreground text-center">
              No emails found for this mailbox.
            </div>
          )}
        </div>
      </section>

      {/* RIGHT: email detail */}
      <section className="flex flex-col min-h-0 h-full">
        {selectedEmailId ? (
          <EmailDetail
            email={selectedEmail}
            isLoading={isLoadingSelectedEmail}
            onCreateTicket={handleCreateTicketFromEmail}
            onBackClick={() => setSelectedEmailId(null)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            <div className="text-center">
              <Mail className="h-10 w-10 mx-auto mb-2 opacity-60" />
              <p>Select an email to view its details.</p>
            </div>
          </div>
        )}
      </section>

      {/* Ticket dialog */}
      <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          {emailForTicket && (
            <CreateTicketFromEmailForm
              email={emailForTicket}
              onClose={() => setIsCreateTicketOpen(false)}
              onSubmit={handleCreateComplaint}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmailDetail({
  email,
  isLoading,
  onCreateTicket,
  onBackClick,
}: {
  email: any
  isLoading: boolean
  onCreateTicket: (email: any) => void
  onBackClick: () => void
}) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!email) return null

  return (
    <div className="flex flex-col h-full min-h-0 bg-card/60">
      <div className="grid grid-cols-[1fr_auto] items-center h-14 px-4 border-b border-border gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onBackClick}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Avatar className="hidden sm:flex h-8 w-8">
            <AvatarImage src={`https://avatar.vercel.sh/${email.from}.png`} />
            <AvatarFallback>
              {email.from?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {email.subject || "(no subject)"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              From: {email.from}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onCreateTicket(email)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Ticket
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 py-3"
      >
        <div
          className="email-body-content prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: email.html || email.text?.replace(/\n/g, "<br/>"),
          }}
        />
      </div>

      <div className="border-t border-border p-3 shrink-0">
        <div className="relative">
          <Input
            placeholder="Type your reply..."
            className="pr-20 text-sm"
          />
          <Button
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 gap-1 text-xs"
          >
            <SendIcon className="h-3.5 w-3.5" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

function CreateTicketFromEmailForm({
  email,
  onClose,
  onSubmit,
}: {
  email: any
  onClose: () => void
  onSubmit: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    title: email?.subject || "",
    priority: "medium",
    building: "",
    room: "",
    reporter: email?.from?.split("<")[0].trim() || "",
    reporterEmail:
      email?.from?.match(/<(.+)>/)?.[1] || email?.from || "",
    phone: "",
    description: email?.text || "",
    category: "uncategorized",
    type: "complaint",
  })

  return (
    <div className="flex flex-col h-full min-h-0">
       <DialogHeader className="shrink-0">
        <DialogTitle>Create New Ticket from Email</DialogTitle>
        <DialogDescription>
          Review the email information and fill in any missing details below.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 min-h-0 overflow-y-auto pr-4 pt-4">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm">Original email</CardTitle>
                  <CardDescription className="text-[11px]">
                    Use the details below to manually prefill building and contact info.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground max-h-48 overflow-y-auto bg-muted/70 p-4 rounded-md">
                <p className="whitespace-pre-wrap">{email.text}</p>
              </div>
            </CardContent>
          </Card>
          
          <CreateComplaintForm
            onClose={onClose}
            onSubmit={onSubmit}
            complaint={formData as any}
          />
        </div>
      </div>
    </div>
  )
}
