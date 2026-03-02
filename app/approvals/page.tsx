
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X, FileText, Package, Trash2, DollarSign, Filter, ChevronsUpDown } from "lucide-react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

const approvalItems = [
    { id: 'REQ-001', type: 'Purchase', item: 'Dell OptiPlex 7010 (x5)', amount: 3500, requestedBy: 'Admin', date: '2024-07-28', status: 'pending' },
    { id: 'SCR-003', type: 'Scrap', item: 'HP LaserJet Pro M404dn', amount: 0, requestedBy: 'Engineer', date: '2024-07-27', status: 'approved' },
    { id: 'REQ-002', type: 'Purchase', item: 'TP-Link RE300 Extender (x20)', amount: 600, requestedBy: 'Admin', date: '2024-07-26', status: 'rejected' },
    { id: 'SCR-004', type: 'Scrap', item: 'Cisco Catalyst 2960 Switch', amount: 0, requestedBy: 'Engineer', date: '2024-07-25', status: 'pending' },
];

function ApprovalsContent() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-bold">Approval Inbox</h1>
            <p className="text-muted-foreground">
                Review and approve or reject purchase and scrap requests.
            </p>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Pending Requests</CardTitle>
                        <CardDescription>You have {approvalItems.filter(i => i.status === 'pending').length} items awaiting your approval.</CardDescription>
                    </div>
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><ChevronsUpDown className="inline-block mr-2 h-4 w-4" />Type</TableHead>
                                <TableHead>Item / Details</TableHead>
                                <TableHead><DollarSign className="inline-block mr-2 h-4 w-4" />Value</TableHead>
                                <TableHead>Requested By</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {approvalItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Badge variant={item.type === 'Purchase' ? 'secondary' : 'destructive'} className="gap-1.5">
                                            {item.type === 'Purchase' ? <Package className="h-3 w-3"/> : <Trash2 className="h-3 w-3"/>}
                                            {item.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.item}</TableCell>
                                    <TableCell>${item.amount.toLocaleString()}</TableCell>
                                    <TableCell>{item.requestedBy}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell><Badge variant={item.status === 'pending' ? 'default' : item.status === 'approved' ? 'outline' : 'destructive'} className="capitalize">{item.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        {item.status === 'pending' ? (
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="outline" size="sm" className="bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20 hover:text-green-800"><Check className="mr-2 h-4 w-4"/>Approve</Button>
                                                <Button variant="outline" size="sm" className="bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20 hover:text-red-800"><X className="mr-2 h-4 w-4"/>Reject</Button>
                                            </div>
                                        ) : (
                                            <Button variant="ghost" size="sm"><FileText className="mr-2 h-4 w-4"/>View Details</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}


export default function ApprovalsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <ApprovalsContent />
        </main>
      </div>
    </div>
  )
}
