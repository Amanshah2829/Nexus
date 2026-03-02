
"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, PackagePlus, Wrench } from "lucide-react"

import { cn } from "@/app/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

const commonParts = [
  { value: "power-adapter", label: "Power Adapter" },
  { value: "lan-cable-1m", label: "LAN Cable (1m)" },
  { value: "lan-cable-5m", label: "LAN Cable (5m)" },
  { value: "rj45-connector", label: "RJ45 Connector" },
  { value: "wifi-extender", label: "WiFi Extender" },
  { value: "ups-battery", label: "UPS Battery" },
]

export function PartsManagement({ onNext, onBack }: { onNext: (data: { partsUsed: { name: string, quantity: number }[], notes: string }) => void; onBack: () => void; }) {
    const [partsUsed, setPartsUsed] = useState<{name: string, quantity: number}[]>([]);
    const [notes, setNotes] = useState("");
    const [isRequesting, setIsRequesting] = useState(false);

    const handleAddPart = (partLabel: string) => {
        setPartsUsed(prev => {
            const existing = prev.find(p => p.name === partLabel);
            if (existing) {
                return prev.map(p => p.name === partLabel ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { name: partLabel, quantity: 1 }];
        });
    };
    
    const handleNext = () => {
        onNext({ partsUsed, notes });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Step 6: Parts & Replacement</CardTitle>
                <CardDescription>Document any parts used or request new parts if unavailable.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="mb-2 block">Part Used / Replaced</Label>
                    <PartSelector onSelectPart={handleAddPart} />
                </div>
                
                {partsUsed.length > 0 && (
                    <div className="space-y-2">
                        <Label>Selected Parts:</Label>
                        {partsUsed.map((part, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <span>{part.name}</span>
                                <div className="flex items-center gap-2">
                                    <Input type="number" value={part.quantity} onChange={(e) => {
                                        const newParts = [...partsUsed];
                                        newParts[index].quantity = parseInt(e.target.value) || 1;
                                        setPartsUsed(newParts);
                                    }} className="h-8 w-16" />
                                     <Button variant="ghost" size="sm" onClick={() => setPartsUsed(partsUsed.filter((_, i) => i !== index))}>Remove</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="space-y-2">
                    <Label htmlFor="part-notes">Replacement Notes</Label>
                    <Textarea id="part-notes" placeholder="e.g., Old adapter was faulty, replaced with new 12V adapter." value={notes} onChange={e => setNotes(e.target.value)}/>
                </div>

                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    <Button onClick={handleNext}>Next: Escalation</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function PartSelector({ onSelectPart }: { onSelectPart: (label: string) => void }) {
    const [open, setOpen] = useState(false)
    const [parts, setParts] = useState(commonParts)
    const [inputValue, setInputValue] = useState("")

    const handleAddNewPart = () => {
        if (inputValue && !parts.some(p => p.label.toLowerCase() === inputValue.toLowerCase())) {
            const newPart = { value: inputValue.toLowerCase().replace(/\s+/g, '-'), label: inputValue };
            setParts(prev => [...prev, newPart]);
            onSelectPart(newPart.label);
            setOpen(false);
            setInputValue("");
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                >
                Select a part or type to add...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                <CommandInput 
                    placeholder="Search part or add new..." 
                    value={inputValue}
                    onValueChange={setInputValue}
                />
                <CommandList>
                    <CommandEmpty>
                        <Button variant="outline" size="sm" onClick={handleAddNewPart}>
                            Add "{inputValue}" as a new part
                        </Button>
                    </CommandEmpty>
                    <CommandGroup>
                    {parts.filter(part => part.label.toLowerCase().includes(inputValue.toLowerCase())).map((part) => (
                        <CommandItem
                        key={part.value}
                        onSelect={() => {
                            onSelectPart(part.label)
                            setOpen(false)
                        }}
                        >
                        <PackagePlus className="mr-2 h-4 w-4"/>
                        {part.label}
                        </CommandItem>
                    ))}
                    </CommandGroup>
                </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
