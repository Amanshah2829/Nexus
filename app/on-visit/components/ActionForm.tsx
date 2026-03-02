
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export function ActionForm({ onNext, onBack }: { onNext: (data: { actionType: string, workPerformed: string, technicalNotes: string, partsNeeded: boolean }) => void; onBack: () => void; }) {
  const [actionType, setActionType] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [technicalNotes, setTechnicalNotes] = useState('');

  const partsNeeded = actionType === 'replacement' || actionType === 'new_installation';
  
  const handleNext = () => {
    onNext({
      actionType,
      workPerformed,
      technicalNotes,
      partsNeeded
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Action Input</CardTitle>
        <CardDescription>Log the work performed and upload any relevant evidence.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label>Action Type</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                    <SelectValue placeholder="Select action taken..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="config_fix">Configuration Fix</SelectItem>
                    <SelectItem value="software_fix">Software Fix</SelectItem>
                    <SelectItem value="physical_repair">Physical Repair</SelectItem>
                    <SelectItem value="replacement">Hardware Replacement Required</SelectItem>
                    <SelectItem value="new_installation">New Installation Required</SelectItem>
                    <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                    <SelectItem value="observation">Observation Only</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="work-performed">Work Performed</Label>
          <Textarea id="work-performed" placeholder="Describe the actions taken, steps performed, and tools used..." rows={5} value={workPerformed} onChange={e => setWorkPerformed(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label>Upload Evidence (Before/After)</Label>
            <div className="grid grid-cols-2 gap-4">
                 <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload 'Before' Photo</p>
                </div>
                 <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload 'After' Photo</p>
                </div>
            </div>
        </div>
         <div className="space-y-2">
          <Label htmlFor="additional-notes">Technical Notes</Label>
          <Textarea id="additional-notes" placeholder="Any other relevant technical details..." rows={3} value={technicalNotes} onChange={e => setTechnicalNotes(e.target.value)} />
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleNext} disabled={!actionType || !workPerformed}>Next</Button>
        </div>
      </CardContent>
    </Card>
  )
}
