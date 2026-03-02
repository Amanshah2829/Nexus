
"use client"

import { useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { IComplaint, IHistory } from "@/models/Complaint"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    FileText, Printer, Download, ChevronLeft, 
    CheckCircle, Wrench, Star, GitCommit, Check, Users
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ITenant } from "../models/Tenant"
import Image from "next/image"
import React from "react"
import { cn } from "../lib/utils"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ReportContent({ complaintId }: { complaintId: string }) {
  const { data: complaint, error } = useSWR<IComplaint>(`/api/complaints/${complaintId}`, fetcher)
  const { data: tenant } = useSWR<ITenant>(complaint ? `/api/tenants/${complaint.tenant}` : null, fetcher);
  const [reportType, setReportType] = useState<'internal' | 'client'>('internal');
  const router = useRouter();

  if (error) return <div className="p-8 text-destructive">Failed to load report data.</div>
  if (!complaint || !tenant) return <div className="flex h-full w-full items-center justify-center"><LoadingAnimation /></div>
  
  const handlePrint = () => { window.print(); }

  // Find the latest history entry that contains on-site visit data
  const visitLog = [...(complaint.history || [])]
    .reverse()
    .find(h => h.details?.visitData);
    
  return (
    <div className="bg-muted/20 min-h-screen p-4 sm:p-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
      
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-6 no-print gap-4">
            <Button variant="outline" onClick={() => router.back()}>
                <ChevronLeft className="h-4 w-4 mr-2"/>
                Back
            </Button>
            <div className="flex items-center gap-2 border bg-card p-1 rounded-lg">
                <Button size="sm" variant={reportType === 'client' ? 'secondary' : 'ghost'} onClick={() => setReportType('client')}>Client Copy</Button>
                <Button size="sm" variant={reportType === 'internal' ? 'secondary' : 'ghost'} onClick={() => setReportType('internal')}>Internal Copy</Button>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2"/>Print</Button>
                <Button onClick={handlePrint}><Download className="h-4 w-4 mr-2"/>Download PDF</Button>
            </div>
        </header>

        <div id="print-section">
           <LongReport complaint={complaint} visitLog={visitLog} tenant={tenant} copyType={reportType} />
        </div>
      </div>
    </div>
  )
}

function LongReport({ complaint, visitLog, tenant, copyType }: { complaint: IComplaint, visitLog: any, tenant: ITenant, copyType: 'internal' | 'client' }) {
    const visitData = visitLog?.details?.visitData;
    const history = complaint.history?.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || [];
    const branding = tenant.branding;
    const showBranding = branding?.enabled;
    
    const companyName = showBranding && branding.companyName ? branding.companyName : tenant.name;
    const companyTagline = showBranding && branding.tagline ? branding.tagline : 'Network & IT Support Division';
    const logoUrl = showBranding ? branding.logoUrl : null;
    
    const resolutionLog = history.find(h => h.action === 'Complaint Resolved');

    return (
        <div className="bg-card p-6 sm:p-10 rounded-lg shadow-2xl shadow-primary/10 border font-sans text-[10pt] leading-normal">
          <header className="flex justify-between items-start mb-8 pb-8 border-b-2 border-primary/20">
            <div>
              <h1 className="text-[18pt] font-semibold text-primary">Service Report</h1>
              <p className="text-muted-foreground font-mono text-[9pt]">ID: {complaint.ticketNumber}</p>
            </div>
             <div className="text-right">
                {logoUrl && <Image src={logoUrl} alt="Company Logo" width={150} height={50} className="mb-2 object-contain ml-auto"/>}
                <p className="font-bold text-lg">{companyName}</p>
                <p className="text-sm text-muted-foreground">{companyTagline}</p>
            </div>
          </header>
          
           <ReportSection title="1. Service Summary">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 font-mono text-[9pt]">
                    <ReportField label="Report ID" value={complaint.ticketNumber} />
                    <ReportField label="Service Type" value="On-Site IT Support" />
                    <ReportField label="Visit Date" value={visitLog ? new Date(visitLog.timestamp).toLocaleDateString() : 'N/A'} />
                    <ReportField label="SLA Status" value={<Badge variant="outline" className="text-[9pt]">Within SLA</Badge>} />
                </div>
            </ReportSection>

          <ReportSection title="2. Client & Location Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <h3 className="text-[11pt] font-medium mb-3 border-b pb-1">Client Details</h3>
                    <div className="space-y-3 font-mono text-[9pt]">
                        <ReportField label="Name" value={complaint.reporter} />
                        <ReportField label="Email" value={complaint.reporterEmail} />
                        <ReportField label="Location" value={`${complaint.building}, Room ${complaint.room}`} />
                        <ReportField label="Tenant / Organization" value={tenant.name} />
                    </div>
                </div>
                 <div>
                    <h3 className="text-[11pt] font-medium mb-3 border-b pb-1">Complaint Details</h3>
                     <div className="space-y-3 font-mono text-[9pt]">
                        <ReportField label="Title" value={complaint.title} />
                        <ReportField label="Priority" value={<Badge variant={complaint.priority === 'critical' || complaint.priority === 'high' ? 'destructive' : 'secondary'} className="capitalize text-[9pt]">{complaint.priority}</Badge>} />
                        <ReportField label="Category" value={<span className="capitalize">{complaint.category}</span>} />
                        <ReportField label="Final Status" value={<Badge variant={complaint.status === 'closed' ? 'default' : 'outline'} className="capitalize text-[9pt]">{complaint.status}</Badge>} />
                    </div>
                </div>
              </div>
          </ReportSection>

            <ReportSection title="3. Complaint Description">
                <div className="text-sm">
                    <p className="text-[9pt] font-medium text-muted-foreground mb-1">Reported Issue:</p>
                    <blockquote className="border-l-4 pl-4 py-2 bg-muted/30 text-muted-foreground text-[10pt] leading-relaxed">
                        {complaint.description}
                    </blockquote>
                </div>
            </ReportSection>

            <ReportSection title="4. Service Timeline">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-[9pt]">Event</TableHead>
                            <TableHead className="text-[9pt] text-right">Date & Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-[10pt]">
                        {history.map((entry, index) => (
                             <TableRow key={index}>
                                <TableCell>{entry.action}</TableCell>
                                <TableCell className="text-right">{new Date(entry.timestamp).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </ReportSection>

          {visitData && (
            <ReportSection title="5. On-Site Visit Details">
                <div className="space-y-8 text-[10pt]">
                    {copyType === 'internal' && (
                        <SubSection title="Engineer Details & Diagnosis">
                            <div className="grid grid-cols-2 gap-x-8 text-[9pt] font-mono">
                                <ReportField label="Engineer Name" value={visitLog?.user || "N/A"} />
                                <ReportField label="Engineer ID" value={"N/A"} />
                            </div>
                            <p className="mt-4 text-[9pt] font-medium text-muted-foreground mb-1">Diagnosis Summary:</p>
                             <blockquote className="border-l-4 pl-4 py-2 bg-muted/30 text-muted-foreground text-[10pt] leading-relaxed">
                                {visitData.diagnostics?.notes || visitData.actions?.[0]?.technicalNotes || 'No specific diagnosis notes recorded.'}
                            </blockquote>
                        </SubSection>
                    )}
                    
                    {copyType === 'internal' && visitData.diagnostics?.checklist && (
                        <SubSection title="Diagnostic Checklist">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[10pt]">
                            {Object.entries(visitData.diagnostics.checklist).map(([item, checked]) => (
                               <div key={item} className="flex items-center gap-2">
                                   {checked ? <Check className="h-4 w-4 text-green-600 flex-shrink-0"/> : <div className="h-4 w-4 flex-shrink-0" />}
                                   <span>{item}</span>
                               </div>
                            ))}
                            </div>
                        </SubSection>
                    )}

                    <SubSection title="Actions Performed">
                         <blockquote className="border-l-4 pl-4 py-2 bg-muted/30 text-muted-foreground text-[10pt] leading-relaxed">
                            {visitData.actions?.[0]?.description || "No specific actions logged."}
                        </blockquote>
                    </SubSection>

                    {copyType === 'internal' && visitData.partsUsed?.length > 0 && (
                        <SubSection title="Parts / Asset Replacement">
                             <Table>
                                <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Serial/ID</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                {visitData.partsUsed.map((part: any, i: number) => (
                                   <TableRow key={i}><TableCell>{part.name}</TableCell><TableCell>N/A</TableCell><TableCell>Replaced</TableCell></TableRow>
                                ))}
                                </TableBody>
                                </Table>
                        </SubSection>
                     )}
                </div>
            </ReportSection>
          )}

           <ReportSection title="9. Visit Outcome">
                 <div className="p-4 bg-muted/30 border-l-4 border-primary rounded-r-lg">
                    <p className="text-[9pt] font-medium text-muted-foreground mb-1">Remarks:</p>
                     <p className="text-[10pt] font-medium">
                         {resolutionLog?.details?.message || visitData?.resolution?.remarks || (complaint.status === 'closed' ? 'Complaint marked as closed.' : 'Complaint is still open or pending follow-up.')}
                     </p>
                 </div>
           </ReportSection>

           {visitData?.confirmation?.signatureImage && (
            <ReportSection title="10. User / Client Confirmation">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-break-inside-avoid">
                    <div>
                        <h3 className="text-[11pt] font-medium mb-2">User Signature</h3>
                        <div className="border-2 border-dashed rounded-lg bg-muted/30 p-2 aspect-video flex items-center justify-center">
                            <img src={visitData.confirmation.signatureImage} alt="User Signature" className="max-w-full max-h-full" />
                        </div>
                         <p className="text-center mt-1 text-[9pt] text-muted-foreground">{complaint.reporter} - {new Date(visitLog.timestamp).toLocaleString()}</p>
                    </div>
                    <div>
                        <h3 className="text-[11pt] font-medium mb-2">Client Feedback</h3>
                        {visitData.confirmation.rating > 0 ? (
                            <>
                                <p className="text-[9pt] text-muted-foreground mb-1">Satisfaction Rating</p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} className={`h-6 w-6 ${visitData.confirmation.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}/>
                                    ))}
                                </div>
                            </>
                        ) : <p className="text-sm text-muted-foreground">No rating was provided.</p> }
                    </div>
                </div>
                 <div className="mt-6 text-[8pt] text-muted-foreground p-3 border-t">
                    <p><strong>Disclaimer:</strong> This document constitutes an official service record generated by the Vynsec Nexus platform. All timestamps, actions, and acknowledgments are system-recorded and tamper-evident. User signatures represent acknowledgment of service execution and explained outcomes at the time of visit and do not waive statutory or contractual rights unless explicitly stated in a governing agreement.</p>
                </div>
            </ReportSection>
           )}

          <footer className="mt-12 pt-6 border-t text-center text-[8pt] text-muted-foreground/80 space-y-2 font-mono">
              <div className="grid grid-cols-3 gap-4">
                  <span>Document Classification: Service Record</span>
                  <span>Report Version: 1.0</span>
                  <span>Generated By: Vynsec Nexus</span>
              </div>
              <div className="pt-2 font-semibold">Data Integrity: Immutable Record</div>
          </footer>
        </div>
    );
}

// Helper components
function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-10 print-break-inside-avoid">
            <h2 className="text-[13pt] font-bold mb-4 pb-2 border-b">{title}</h2>
            <div>{children}</div>
        </section>
    );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="print-break-inside-avoid">
            <h3 className="text-[11pt] font-medium text-muted-foreground mb-3">{title}</h3>
            {children}
        </div>
    )
}

function ReportField({ label, value }: { label: string; value: React.ReactNode}) {
    return (
        <div>
            <p className="text-[9pt] text-muted-foreground">{label}</p>
            <div className="font-medium text-[10pt]">{value}</div>
        </div>
    )
}
