
"use client"

import { cn } from "@/app/lib/utils";
import type { OnVisitStep } from "@/app/on-visit/types";

const steps: { id: OnVisitStep, name: string }[] = [
    { id: 'arrival_confirm', name: 'Arrival' },
    { id: 'device_selection', name: 'Device ID' },
    { id: 'issue_selection', name: 'Issue ID' },
    { id: 'issue_description', name: 'Describe Issue' },
    { id: 'diagnostics', name: 'Diagnostics' },
    { id: 'action_plan', name: 'Action Plan' },
    { id: 'parts_management', name: 'Parts' },
    { id: 'resolution', name: 'Resolution' },
    { id: 'customer_confirmation', name: 'Confirmation' },
    { id: 'completion', name: 'Complete' },
];

export function VisitStepper({ currentStep }: { currentStep: OnVisitStep }) {
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="p-4">
            <h3 className="font-semibold mb-4">Visit Progress</h3>
            <nav>
                <ul className="space-y-4">
                    {steps.map((step, index) => {
                        const isStepVisible = step.id !== 'issue_description' || currentStep === 'issue_description' || currentIndex > steps.findIndex(s => s.id === 'issue_description');
                        if (!isStepVisible && step.id !== 'diagnostics') {
                            const isDiagnosticsNext = steps[currentIndex + 1]?.id === 'diagnostics';
                             if(step.id === 'issue_description' && !isDiagnosticsNext && currentIndex < steps.findIndex(s => s.id === 'issue_description')) return null;
                        }
                        return (
                        <li key={step.id} className="flex items-start">
                            <div className="flex flex-col items-center mr-4">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center border-2", 
                                  index < currentIndex ? 'bg-green-500 border-green-500 text-white' : 
                                  index === currentIndex ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border'
                                )}>
                                    {index < currentIndex ? '✔' : index + 1}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={cn(
                                      "w-0.5 flex-1 mt-2", 
                                      index < currentIndex ? 'bg-green-500' : 'bg-border'
                                    )} />
                                )}
                            </div>
                            <div className={cn(
                              "pt-1",
                              index === currentIndex && 'font-bold text-primary'
                            )}>
                                {step.name}
                            </div>
                        </li>
                    )})}
                </ul>
            </nav>
        </div>
    );
}
