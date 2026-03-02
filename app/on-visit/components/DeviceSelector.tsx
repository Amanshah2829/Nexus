"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Router, Laptop, Printer, Wifi, Server, Cpu } from "lucide-react"

const deviceTypes = [
    { id: "network", name: "Network Devices", icon: Router, description: "AP, Switch, Router, Firewall" },
    { id: "user", name: "User Devices", icon: Laptop, description: "Laptop, Desktop, Monitor" },
    { id: "peripheral", name: "Peripherals", icon: Printer, description: "Printer, UPS, CCTV, NVR" },
    { id: "service", name: "Software/Service", icon: Wifi, description: "Email, VPN, ERP, Internet" },
    { id: "iot", name: "IoT/Smart Devices", icon: Cpu, description: "Smart sensors, controllers, etc." },
    { id: "other", name: "Other", icon: Server, description: "Custom or unlisted devices" },
]

export function DeviceSelector({ onNext, onBack }: { onNext: (deviceType: string) => void, onBack: () => void }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 2: Select Device Category</CardTitle>
                <CardDescription>Identify the type of device or service related to the complaint.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deviceTypes.map(device => (
                        <button 
                            key={device.id} 
                            onClick={() => onNext(device.id)} 
                            className="text-left p-4 border rounded-lg hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <div className="flex items-center gap-4">
                                <device.icon className="h-8 w-8 text-primary" />
                                <div>
                                    <h3 className="font-semibold text-md">{device.name}</h3>
                                    <p className="text-sm text-muted-foreground">{device.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                 <div className="mt-6 flex justify-start">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                </div>
            </CardContent>
        </Card>
    )
}
