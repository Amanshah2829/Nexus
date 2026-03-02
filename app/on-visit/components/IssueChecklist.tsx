
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const checklists: Record<string, { title: string; items: string[] }> = {
    'no-power': {
        title: "No Power Diagnostics",
        items: [
            "Checked power adapter connection at both ends.",
            "Verified the power socket is working with another device.",
            "Confirmed LED status on the device (any lights on?).",
            "Attempted to reboot the device.",
            "Tried an alternative power adapter if available."
        ]
    },
    'no-connectivity': {
        title: "No Connectivity Diagnostics",
        items: [
            "Verified physical connection from source to router WAN port.",
            "Checked if device dashboard is accessible.",
            "Checked WAN IP status in router dashboard.",
            "Pinged gateway from a connected device (e.g., 8.8.8.8).",
            "Tested DNS resolution (e.g., ping google.com)."
        ]
    },
    'default': {
        title: "General Diagnostics",
        items: [
            "Visually inspected the device for any physical damage.",
            "Checked all cable connections related to the device.",
            "Attempted a power cycle (reboot) of the device.",
            "Noted any error messages or indicator light patterns."
        ]
    }
}

export function IssueChecklist({ issueId, onNext, onBack }: { issueId: string, onNext: (data: { checklist: Record<string, boolean>, notes: string }) => void; onBack: () => void; }) {
    const checklist = checklists[issueId] || checklists['default'];
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [notes, setNotes] = useState('');

    const handleCheck = (item: string, isChecked: boolean) => {
        setCheckedItems(prev => ({ ...prev, [item]: isChecked }));
    };
    
    const allChecked = checklist.items.every(item => checkedItems[item]);

    const handleNext = () => {
        onNext({ checklist: checkedItems, notes });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 4: Guided Checklist - {checklist.title}</CardTitle>
                <CardDescription>Follow these steps to diagnose the issue. Attach mandatory evidence before proceeding.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {checklist.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
                            <Checkbox 
                                id={`checklist-${index}`} 
                                onCheckedChange={(c) => handleCheck(item, !!c)}
                                checked={!!checkedItems[item]}
                            />
                            <Label htmlFor={`checklist-${index}`} className="text-sm font-normal leading-snug">
                                {item}
                            </Label>
                        </div>
                    ))}
                </div>
                 <div className="mt-6 space-y-4 pt-4 border-t">
                    <Label className="font-semibold">Diagnostic Notes</Label>
                    <Textarea 
                        placeholder="Add notes on your findings, any specific readings, or observations..." 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
                 <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    <Button onClick={handleNext} disabled={!allChecked}>Next: Action Input</Button>
                </div>
            </CardContent>
        </Card>
    )
}
