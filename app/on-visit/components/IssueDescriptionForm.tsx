
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export function IssueDescriptionForm({ onNext, onBack }: { onNext: (data: { otherIssueDescription: string }) => void; onBack: () => void; }) {
  const [description, setDescription] = useState('');

  const handleNext = () => {
    onNext({ otherIssueDescription: description });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Describe the Issue</CardTitle>
        <CardDescription>Since you selected "Other," please provide a detailed description of the problem you observed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="issue-description">Specific Issue Description</Label>
          <Textarea 
            id="issue-description" 
            placeholder="e.g., The CCTV camera is pointing at the ceiling and making a clicking noise..." 
            rows={6} 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleNext} disabled={!description.trim()}>Next</Button>
        </div>
      </CardContent>
    </Card>
  )
}
