
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, Repeat, Wrench, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type ResolutionStatus = "resolved" | "follow-up" | "part-unavailable" | "cannot-reproduce"

const resolutionOptions = [
    { id: "resolved", label: "Issue Resolved", icon: Check, description: "The problem has been fully fixed." },
    { id: "follow-up", label: "Requires Follow-up Visit", icon: Repeat, description: "Another visit is necessary to resolve." },
    { id: "part-unavailable", label: "Part Not Available", icon: Wrench, description: "A required part is not on hand." },
    { id: "cannot-reproduce", label: "Could Not Reproduce", icon: XCircle, description: "The issue could not be observed." },
]

export function ResolutionSelector({ onNext, onBack }: { onNext: (data: any) => void; onBack: () => void; }) {
    const [status, setStatus] = useState<ResolutionStatus>("resolved")
    const [formData, setFormData] = useState<any>({});

    const handleNext = () => {
        onNext({ status, ...formData });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 7: Visit Result</CardTitle>
                <CardDescription>Select the final status of this service visit and provide necessary details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup value={status} onValueChange={(v) => setStatus(v as ResolutionStatus)} className="grid md:grid-cols-2 gap-4">
                    {resolutionOptions.map(option => (
                        <Label key={option.id} htmlFor={option.id} className="flex flex-col items-start space-y-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                            <div className="flex items-center gap-2">
                                <option.icon className="h-5 w-5" />
                                <span className="font-semibold">{option.label}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{option.description}</span>
                        </Label>
                    ))}
                </RadioGroup>

                {status === "resolved" && <ResolvedForm onChange={setFormData} />}
                {(status === "follow-up" || status === "part-unavailable") && <FollowUpForm onChange={setFormData} />}
                {status === 'cannot-reproduce' && (
                    <div>
                        <Label htmlFor="resolve-notes">Remarks</Label>
                        <Textarea id="resolve-notes" placeholder="Describe what was tested and why the issue could not be reproduced..." onChange={e => setFormData({ remarks: e.target.value })}/>
                    </div>
                )}
                <div className="flex justify-between">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    <Button onClick={handleNext}>Next: Customer Confirmation</Button>
                </div>
            </CardContent>
        </Card>
    )
}

function ResolvedForm({ onChange }: { onChange: (data: any) => void }) {
    return (
        <div className="p-4 border rounded-md bg-muted/50 space-y-4">
            <h3 className="font-medium">Resolution Details</h3>
            <div className="space-y-2">
                <Label htmlFor="time-taken">Time Taken (in minutes)</Label>
                <Input id="time-taken" type="number" placeholder="e.g., 45" onChange={e => onChange({ timeTaken: e.target.value })} />
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="customer-verified" onCheckedChange={c => onChange({ customerVerified: !!c })} />
                <Label htmlFor="customer-verified">Work verified by customer?</Label>
            </div>
        </div>
    )
}

function FollowUpForm({ onChange }: { onChange: (data: any) => void }) {
    return (
        <div className="p-4 border rounded-md bg-muted/50 space-y-4">
            <h3 className="font-medium">Follow-up Details</h3>
            <div className="space-y-2">
                <Label htmlFor="required-part">Required Part / Tool</Label>
                <Input id="required-part" placeholder="e.g., 12V Power Adapter, Crimping Tool" onChange={e => onChange({ requiredPart: e.target.value })}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="next-visit-date">Tentative Next Visit Date</Label>
                <Input id="next-visit-date" type="date" onChange={e => onChange({ nextVisitDate: e.target.value })} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="follow-up-remarks">Remarks</Label>
                <Textarea id="follow-up-remarks" placeholder="Reason for follow-up, what to prepare for next visit, etc." onChange={e => onChange({ remarks: e.target.value })}/>
            </div>
        </div>
    )
}
