
"use client"

import { useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, FileText, Eye, Download } from "lucide-react"
import { IComplaint } from "@/models/Complaint"
import { LoadingAnimation } from "@/components/ui/loading-animation"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ReportsContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: complaints, error } = useSWR<IComplaint[]>('/api/complaints?status=all', fetcher);

  const complaintsArray = Array.isArray(complaints) ? complaints : [];

  const filteredComplaints = complaintsArray.filter(c => 
    c.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.reporter?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) return <div className="text-center p-8 text-destructive">Failed to load reports.</div>;
  if (!complaints && !error) return <div className="flex h-full items-center justify-center"><LoadingAnimation /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Complaint Reports</h1>
          <p className="text-muted-foreground">Access and view detailed service reports for all tickets.</p>
        </div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export All</Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Tickets</CardTitle>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by ID, title, or reporter..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map(complaint => (
                <TableRow key={complaint._id}>
                  <TableCell className="font-mono">{complaint.id}</TableCell>
                  <TableCell className="font-medium">{complaint.title}</TableCell>
                  <TableCell>{complaint.reporter}</TableCell>
                  <TableCell><Badge variant={complaint.status === 'closed' ? 'default' : 'secondary'} className="capitalize">{complaint.status}</Badge></TableCell>
                  <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/report/${complaint._id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredComplaints.length === 0 && (
                <div className="text-center p-10 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2"/>
                    <p>No reports match your search.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
