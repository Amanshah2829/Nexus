
"use client"

import React, { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { IComplaint } from "@/models/Complaint"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, User, MapPin } from "lucide-react"
import { VisitStepper } from "@/app/on-visit/components/VisitStepper"
import { DeviceSelector } from "@/app/on-visit/components/DeviceSelector"
import { IssueCategorySelector } from "@/app/on-visit/components/IssueCategorySelector"
import { IssueDescriptionForm } from "@/app/on-visit/components/IssueDescriptionForm"
import { IssueChecklist } from "@/app/on-visit/components/IssueChecklist"
import { ActionForm } from "@/app/on-visit/components/ActionForm"
import { ResolutionSelector } from "@/app/on-visit/components/ResolutionSelector"
import { CustomerConfirmation } from "@/app/on-visit/components/CustomerConfirmation"
import { PartsManagement } from "@/app/on-visit/components/PartsManagement"
import { useToast } from "@/hooks/use-toast"
import { IUser } from "@/models/User"
import type { OnVisitStep } from "@/app/on-visit/types"

const fetcher = (url: string) => fetch(url).then(res => res.json())

function CompletionStep({ complaint }: { complaint: IComplaint }) {
  const router = useRouter();
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>Visit Completed Successfully</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-green-500 mb-4">✓ Report submitted. ✓ User verified.</p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push(`/report/${complaint._id}`)}>View Report</Button>
          <Button onClick={() => router.push('/engineer')}>Back to Dashboard</Button>
        </div>
      </CardContent>
    </Card>
  );
}


function OnVisitContentComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const complaintId = searchParams.get("id")
  const { toast } = useToast()

  const { data: complaint, error: complaintError } = useSWR<IComplaint>(complaintId ? `/api/complaints/${complaintId}` : null, fetcher)
  const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher);


  const [step, setStep] = useState<OnVisitStep>("arrival_confirm")
  const [visitData, setVisitData] = useState<any>({});
  const [completedComplaint, setCompletedComplaint] = useState<IComplaint | null>(null);
  
  const updateVisitData = (newData: any) => {
    setVisitData((prev: any) => ({ ...prev, ...newData }));
  }

  const handleVisitCompletion = async (confirmationData?: any) => {
    if (!complaint || !currentUser) return;
    
    let finalStatus: IComplaint['status'] = 'visited';
    let historyAction = 'On-Site Visit Completed';
    let historyMessage = 'Engineer completed the on-site diagnostic and data collection workflow.';

    if (visitData.resolution?.status === 'resolved' && confirmationData?.signature) {
        finalStatus = 'closed';
        historyAction = 'Complaint Resolved';
        historyMessage = visitData.resolution?.remarks || visitData.action?.workPerformed || 'Issue resolved on-site.';
    } else if (visitData.resolution?.status === 'follow-up') {
        finalStatus = 'follow-up';
        historyAction = 'Follow-up Required';
        historyMessage = visitData.resolution?.remarks || 'A follow-up visit is required.';
    } else if (visitData.resolution?.status === 'part-unavailable') {
        finalStatus = 'follow-up';
        historyAction = 'Follow-up Required (Part Unavailable)';
        historyMessage = `Required part: ${visitData.resolution?.requiredPart}. ${visitData.resolution?.remarks || ''}`;
    } else if (visitData.resolution?.status === 'cannot-reproduce') {
          finalStatus = 'observation';
          historyAction = 'Issue Not Reproduced';
          historyMessage = visitData.resolution?.remarks || 'The reported issue could not be reproduced during the visit.';
    }

    // Structure the visitData object according to the new schema design
    const structuredVisitData = {
        diagnostics: {
            deviceCategory: visitData.deviceType,
            issueType: visitData.issue?.title,
            checklist: visitData.diagnostics?.checklist,
            otherIssueText: visitData.otherIssueDescription,
            notes: visitData.diagnostics?.notes,
        },
        actions: [
            {
                description: visitData.action?.workPerformed,
                technicalNotes: visitData.action?.technicalNotes,
                performedAt: new Date().toISOString()
            }
        ],
        partsUsed: visitData.parts?.partsUsed,
        confirmation: {
            userName: complaint.reporter,
            signatureImage: confirmationData?.signature,
            rating: confirmationData?.rating,
            feedback: null, // Not implemented yet
            confirmedAt: confirmationData?.signature ? new Date().toISOString() : null
        },
        resolution: visitData.resolution,
    };
    
    try {
        const payload: any = { 
            status: finalStatus,
            history: [{
                action: historyAction,
                user: currentUser.name,
                timestamp: new Date(),
                details: { 
                    message: historyMessage,
                    visitData: structuredVisitData // Storing the structured visit data
                }
            }]
        };

        if (finalStatus === 'closed') {
            payload.resolvedAt = new Date();
        }

        const response = await fetch(`/api/complaints/${complaint._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const updatedComplaint = await response.json();
        if (!response.ok) throw new Error(updatedComplaint.message || "Failed to submit final visit details.");
        
        mutate(`/api/complaints/${complaint._id}`, updatedComplaint, false); // Update local SWR cache
        setCompletedComplaint(updatedComplaint);
        setStep("completion");
        toast({
            title: "Visit Completed",
            description: "Service report has been submitted and status updated.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
        });
    }
  }


  if (!complaintId) {
    return <div className="p-4 text-destructive">No complaint ID specified.</div>
  }
  if (complaintError) {
    return <div className="p-4 text-destructive">Failed to load complaint details.</div>
  }
  if (!complaint) {
    return <div className="flex h-screen w-full items-center justify-center"><LoadingAnimation /></div>
  }

  const renderStep = () => {
    switch (step) {
      case "arrival_confirm":
        return (
          <Card>
            <CardHeader><CardTitle>Step 1: Confirm Arrival</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-4">You are at the location for complaint <strong>{complaint.id}</strong>. Begin the diagnostic process.</p>
              <Button onClick={() => setStep("device_selection")}>Start Visit & Identify Device</Button>
            </CardContent>
          </Card>
        )
      case "device_selection":
        return <DeviceSelector onNext={(deviceType) => { updateVisitData({ deviceType }); setStep('issue_selection'); }} onBack={() => setStep('arrival_confirm')}/>
      case "issue_selection":
        return <IssueCategorySelector 
                  complaint={complaint} 
                  deviceType={visitData.deviceType} 
                  onSelect={(issue) => { 
                    updateVisitData({ issue });
                    if (issue.id.endsWith('-other')) {
                      setStep('issue_description');
                    } else {
                      setStep('diagnostics');
                    }
                  }} 
                  onBack={() => setStep('device_selection')} 
               />
      case "issue_description":
        return <IssueDescriptionForm
                onNext={(data) => {
                    updateVisitData(data);
                    setStep('action_plan');
                }}
                onBack={() => setStep('issue_selection')}
               />
      case "diagnostics":
        return <IssueChecklist issueId={visitData.issue?.id} onNext={(data) => { updateVisitData({ diagnostics: data }); setStep('action_plan'); }} onBack={() => setStep('issue_selection')} />
      case "action_plan":
        return <ActionForm onNext={(data) => { updateVisitData({ action: data }); setStep(data.partsNeeded ? 'parts_management' : 'resolution'); }} onBack={() => visitData.issue.id.endsWith('-other') ? setStep('issue_description') : setStep('diagnostics')} />
      case "parts_management":
        return <PartsManagement onNext={(data) => { updateVisitData({ parts: data }); setStep('resolution'); }} onBack={() => setStep('action_plan')} />
      case "resolution":
         return <ResolutionSelector onNext={(data) => { updateVisitData({ resolution: data }); setStep('customer_confirmation'); }} onBack={() => visitData.action?.partsNeeded ? setStep('parts_management') : setStep('action_plan')} />
      case "customer_confirmation":
        return <CustomerConfirmation 
                  resolutionStatus={visitData.resolution?.status}
                  onNext={(data) => { 
                    handleVisitCompletion(data); 
                  }} 
                  onBack={() => setStep('resolution')} 
                />
      case "completion":
        return completedComplaint ? <CompletionStep complaint={completedComplaint} /> : <LoadingAnimation />;
      default:
        return <div>Invalid step</div>
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="p-4 sm:p-6 md:p-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">On-Site Visit</h1>
          <p className="text-muted-foreground">Complaint ID: {complaint.id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_320px] gap-6 px-4 sm:px-6 md:px-8 pb-8">
        {/* Left Sidebar: Stepper */}
        <aside className="hidden md:block bg-card p-4 rounded-lg self-start sticky top-6">
          <VisitStepper currentStep={step} />
        </aside>

        {/* Middle Content: Main wizard area */}
        <main>
          {renderStep()}
        </main>

        {/* Right Sidebar: Contextual Info */}
        <aside className="hidden lg:block space-y-6 self-start sticky top-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User /> Reporter Info</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Name:</strong> {complaint.reporter}</p>
              <p><strong>Email:</strong> {complaint.reporterEmail}</p>
              <p><strong>Phone:</strong> {complaint.phone || 'N/A'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin /> Location Info</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Building:</strong> {complaint.building}</p>
              <p><strong>Room:</strong> {complaint.room}</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

export function OnVisitContent() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><LoadingAnimation /></div>}>
            <OnVisitContentComponent />
        </Suspense>
    )
}
