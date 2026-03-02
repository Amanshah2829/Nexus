
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, Printer, Laptop, Server, AlertTriangle, Sparkles, Loader2, Router, HardDrive, Tv, Power, Cpu } from "lucide-react"
import { IComplaint } from "@/models/Complaint"
import { useState } from "react"
import { diagnoseIssue, DiagnoseIssueOutput } from "@/ai/flows/diagnose-issue-flow"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const issueCategoriesByDevice: Record<string, { icon: React.ElementType, issues: { id: string, title: string, description: string }[] }> = {
    "network": {
        icon: Router,
        issues: [
            { id: "no-connectivity", title: "No Connectivity", description: "Ping failure, DHCP issue, authentication error." },
            { id: "slow-speed", title: "Slow Speed", description: "High latency, low bandwidth." },
            { id: "disconnection", title: "Frequent Disconnection", description: "Intermittent loss of connection." },
            { id: "no-power", title: "No Power", description: "Device is off, no LEDs." },
            { id: "config-issue", title: "Configuration Issue", description: "VLAN, firewall, or routing problems." },
            { id: "hardware-fault", title: "Hardware Fault", description: "Port down, PoE failure, overheating." },
            { id: "network-other", title: "Other", description: "Describe a specific network problem not listed." },
        ]
    },
    "user": {
        icon: Laptop,
        issues: [
            { id: "no-boot", title: "No Boot / Power On", description: "Device does not start." },
            { id: "os-error", title: "OS Error / Blue Screen", description: "Operating system crashes or fails to load." },
            { id: "slow-performance", title: "Slow Performance", description: "System is lagging or unresponsive." },
            { id: "display-issue", title: "Display Issue", description: "No display, artifacts, or flickering." },
            { id: "input-issue", title: "Keyboard/Mouse Issue", description: "Input devices are not working." },
            { id: "battery-issue", title: "Battery/Charger Fault", description: "Not charging or draining too fast." },
            { id: "user-other", title: "Other", description: "Describe a specific user device problem not listed." },
        ]
    },
    "peripheral": {
        icon: Printer,
        issues: [
            { id: "cctv-no-display", title: "CCTV - No Display", description: "DVR output not showing." },
            { id: "cctv-blurry", title: "CCTV - Blurry Video", description: "Camera feed is out of focus." },
            { id: "nvr-offline", title: "NVR/DVR Offline", description: "Recording unit is not accessible." },
            { id: "printer-no-print", title: "Printer - Not Printing", description: "Jobs sent but nothing prints." },
            { id: "ups-no-backup", title: "UPS - No Power Backup", description: "UPS fails to provide power." },
            { id: "cable-cut", title: "Cable/Port Damage", description: "Physical damage to wiring." },
            { id: "peripheral-other", title: "Other", description: "Describe a specific peripheral issue not listed." },
        ]
    },
    "service": {
        icon: Wifi,
        issues: [
            { id: "email-issue", title: "Email Issue", description: "Cannot send/receive emails." },
            { id: "vpn-issue", title: "VPN Connection Failed", description: "Unable to connect to VPN." },
            { id: "erp-issue", title: "ERP/Portal Access Issue", description: "Cannot log in or use the ERP system." },
            { id: "wifi-auth-issue", title: "WiFi Authentication Issue", description: "Correct password not working." },
            { id: "internet-down", title: "Internet Service Down", description: "ISP or main line is down." },
            { id: "service-other", title: "Other", description: "Describe a specific software/service issue not listed." },
        ]
    },
    "iot": {
        icon: Cpu,
        issues: [
            { id: "iot-no-power", title: "No Power", description: "Device is offline or unresponsive." },
            { id: "iot-not-reporting", title: "Not Reporting Data", description: "Sensor is not sending data to the server." },
            { id: "iot-config-issue", title: "Configuration Issue", description: "Incorrect settings or pairing problems." },
            { id: "iot-other", title: "Other", description: "Describe a specific IoT device problem." },
        ]
    },
    "default": {
        icon: AlertTriangle,
        issues: [
            { id: "general-check", title: "General Diagnostics", description: "Start a general checkup for an undefined issue." },
        ]
    }
}

function AiDiagnosisDialog({ diagnosis, onClose }: { diagnosis: DiagnoseIssueOutput, onClose: () => void }) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Diagnosis Results</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                        <h3 className="font-semibold mb-2">Probable Causes</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {diagnosis.probableCauses.map((cause, i) => <li key={i}>{cause}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Recommended Troubleshooting Steps</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            {diagnosis.troubleshootingSteps.map((step, i) => <li key={i} className="p-2 bg-muted/50 rounded-md">{step}</li>)}
                        </ol>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function IssueCategorySelector({ deviceType, complaint, onSelect, onBack }: { deviceType: string; complaint: IComplaint; onSelect: (issue: { id: string, title: string }) => void; onBack: () => void; }) {
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiDiagnosis, setAiDiagnosis] = useState<DiagnoseIssueOutput | null>(null);

    const { issues } = issueCategoriesByDevice[deviceType] || issueCategoriesByDevice['default'];

    const handleAiDiagnose = async () => {
        setIsLoadingAi(true);
        setAiDiagnosis(null);
        try {
            const result = await diagnoseIssue({
                title: complaint.title,
                description: complaint.description,
            });
            setAiDiagnosis(result);
        } catch (error) {
            console.error("AI diagnosis failed:", error);
        } finally {
            setIsLoadingAi(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Step 3: Select Diagnosed Issue</CardTitle>
                        <CardDescription>Choose the category that best matches your findings for this device.</CardDescription>
                    </div>
                     <Button variant="outline" size="sm" onClick={handleAiDiagnose} disabled={isLoadingAi}>
                        {isLoadingAi ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        AI Diagnosis
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {issues.map(issue => (
                        <button key={issue.id} onClick={() => onSelect({ id: issue.id, title: issue.title })} className="text-left p-4 border rounded-lg hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                            <h3 className="font-semibold text-md mb-1">{issue.title}</h3>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex justify-start">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                </div>
            </CardContent>
             {aiDiagnosis && <AiDiagnosisDialog diagnosis={aiDiagnosis} onClose={() => setAiDiagnosis(null)} />}
        </Card>
    )
}
