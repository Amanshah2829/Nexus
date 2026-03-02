
"use client"

import { useState, useMemo, DragEvent } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Wifi, CheckCircle, User, FileUp, Loader2, Save, FileDown, History, ArrowUpDown, Edit, Trash2, AlertTriangle, GitMerge, Info, Building, ChevronRight, Home, Camera, ShieldCheck, ShieldAlert, Shield, PackagePlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IAsset } from "@/models/Asset"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { Label } from "@/components/ui/label"
import Papa from 'papaparse'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ITenant } from "@/models/Tenant"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ImportResults = {
    message: string;
    successes: any[];
    failures: any[];
};

const findBestHeaderMatch = (fieldKey: string, csvHeaders: string[]): string | null => {
    const lowerFieldKey = fieldKey.toLowerCase();
    const commonVariations: Record<string, string[]> = {
        serialNumber: ['serial', 'srno', 'sr.no', 'serialnumber', 'serial no'],
        assetNo: ['asset', 'assetno', 'asset number'],
        macAddress: ['mac', 'macaddress', 'mac address'],
        purchaseDate: ['purchase', 'purchasedate', 'date'],
        name: ['name', 'user', 'allotedto', 'allotted to'],
        registrationNumber: ['regno', 'registration', 'registration number'],
        building: ['building', 'hostel'],
        roomNumber: ['room', 'roomno', 'room number'],
        allotmentDate: ['issued', 'issueddate', 'allotmentdate', 'issued date'],
        mobileNumber: ['contact', 'mobile', 'phone', 'contactno', 'contact number'],
    };

    for (const header of csvHeaders) {
        const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/gi, '');
        if (lowerHeader === lowerFieldKey) return header;
        if (commonVariations[fieldKey]?.some(v => lowerHeader.includes(v))) return header;
    }
    return null;
};

function Stepper({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-all
            ${i <= active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground"}`}
        >
          <div className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${i <= active ? "bg-primary-foreground text-primary" : "bg-muted-foreground/20 text-muted-foreground"}`}>{i + 1}</div>
          <span className="hidden sm:inline font-medium">{s}</span>
        </div>
      ))}
    </div>
  )
}


export function IssueContent() {
    const [importResults, setImportResults] = useState<ImportResults | null>(null);

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold flex items-center gap-3"><PackagePlus className="h-7 w-7" /> Asset Onboarding & Issuance</h1>
                <p className="text-muted-foreground">Bulk import new assets or allot existing assets to users via CSV upload.</p>
            </div>
            <Tabs defaultValue="allotment" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="allotment">Bulk Allot Assets</TabsTrigger>
                    <TabsTrigger value="import">Bulk Import New Assets</TabsTrigger>
                </TabsList>
                <TabsContent value="allotment" className="mt-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <BulkAllotmentCard setImportResults={setImportResults} />
                    </motion.div>
                </TabsContent>
                <TabsContent value="import" className="mt-6">
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <BulkImportCard setImportResults={setImportResults} />
                    </motion.div>
                </TabsContent>
            </Tabs>

            {importResults && (
                <ImportSummaryDialog
                    isOpen={!!importResults}
                    onClose={() => setImportResults(null)}
                    results={importResults}
                />
            )}
        </div>
    )
}

const requiredAssetFields = [
    { key: "serialNumber", label: "Serial Number", required: true },
    { key: "assetNo", label: "Asset Number" },
    { key: "make", label: "Make" },
    { key: "model", label: "Model" },
    { key: "macAddress", label: "MAC Address" },
    { key: "purchaseDate", label: "Purchase Date" },
];

function BulkImportCard({ setImportResults }: { setImportResults: (results: ImportResults | null) => void }) {
    const { toast } = useToast();
    const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const csvHeaders = (results.meta.fields || []).filter(Boolean);
                    setHeaders(csvHeaders);

                    const autoMapping: Record<string, string> = {};
                    requiredAssetFields.forEach(field => {
                        const bestMatch = findBestHeaderMatch(field.key, csvHeaders);
                        if (bestMatch) autoMapping[field.key] = bestMatch;
                    });
                    setMapping(autoMapping);

                    setParsedData(results.data);
                    setStep('map');
                },
            });
        }
    };
    
    const handleConfirmMapping = () => {
        const missingRequired = requiredAssetFields.some(f => f.required && !mapping[f.key]);
        if (missingRequired) {
            toast({ variant: 'destructive', title: 'Mapping Incomplete', description: 'Please map all required fields (*).' });
            return;
        }
        setStep('preview');
    };

    const getTransformedData = useMemo(() => {
        if (step !== 'preview') return [];
        return parsedData.map(row => {
            const newRow: Partial<IAsset> = {};
            for (const field of requiredAssetFields) {
                const csvHeader = mapping[field.key];
                if (csvHeader && row[csvHeader] !== undefined) {
                    (newRow as any)[field.key] = row[csvHeader];
                }
            }
            return newRow;
        }).filter(row => row.serialNumber);
    }, [parsedData, mapping, step]);

    const handleSubmit = async () => {
        const transformedData = getTransformedData();
        if (transformedData.length === 0) return;
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/inventory/assets/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assets: transformedData }),
            });
            const result = await response.json();
            if (!response.ok && response.status !== 207) throw new Error(result.message || 'Failed to import assets');
            setImportResults({ message: result.message, successes: result.successes || [], failures: result.failures || [] });
            mutate('/api/inventory/assets?status=all&sortKey=serialNumber&sortDirection=asc');
            resetState();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Import Error', description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const resetState = () => {
        setFile(null);
        setParsedData([]);
        setHeaders([]);
        setMapping({});
        setStep('upload');
    }

    if (step === 'map') {
        return (
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                     <Stepper steps={["Upload", "Map", "Preview"]} active={1} />
                    <CardTitle className="pt-4">Map CSV Columns to Asset Fields</CardTitle>
                    <CardDescription>Ensure the columns from your file correctly match the required database fields. Our system has made some intelligent guesses for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {requiredAssetFields.map(field => (
                         <div key={field.key} className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:items-center sm:gap-4">
                             <Label htmlFor={`map-${field.key}`}>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
                             <Select value={mapping[field.key]} onValueChange={value => setMapping(prev => ({...prev, [field.key]: value}))}>
                                 <SelectTrigger id={`map-${field.key}`} className="h-11 rounded-lg"><SelectValue placeholder="Select CSV column..." /></SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="N/A">_Skip this field_</SelectItem>
                                     {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                 </SelectContent>
                             </Select>
                         </div>
                    ))}
                </CardContent>
                <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={resetState} className="h-11 rounded-xl w-full sm:w-auto">Back</Button>
                    <Button onClick={handleConfirmMapping} className="h-11 rounded-xl w-full sm:w-auto">Confirm Mapping & Preview</Button>
                </CardFooter>
            </Card>
        )
    }

    if (step === 'preview') {
         const previewData = getTransformedData();
         return (
             <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <Stepper steps={["Upload", "Map", "Preview"]} active={2} />
                    <CardTitle className="pt-4">Preview & Confirm Import</CardTitle>
                    <CardDescription>Review the mapped data below. If it looks correct, proceed with the import. {previewData.length} records will be imported.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="block sm:hidden space-y-2">
                        {previewData.slice(0, 10).map((row, i) => (
                            <Card key={i} className="p-4">
                                <p className="text-sm font-medium">{row.serialNumber}</p>
                                <p className="text-xs text-muted-foreground">{row.model}</p>
                                <p className="text-xs text-muted-foreground">{row.assetNo}</p>
                            </Card>
                        ))}
                         {previewData.length > 10 && <p className="text-center text-xs text-muted-foreground p-2">...and {previewData.length - 10} more rows.</p>}
                    </div>
                     <div className="hidden sm:block relative overflow-x-auto rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>{requiredAssetFields.map(f => <TableHead key={f.key} className="whitespace-nowrap">{f.label}</TableHead>)}</TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewData.slice(0, 20).map((row, index) => (
                                    <TableRow key={index}>
                                        {requiredAssetFields.map(f => <TableCell key={f.key} className="whitespace-nowrap">{(row as any)[f.key]}</TableCell>)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {previewData.length > 20 && <div className="text-center p-2 text-sm text-muted-foreground">...and {previewData.length - 20} more rows.</div>}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={() => setStep('map')} className="h-11 rounded-xl w-full sm:w-auto">Back to Mapping</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="h-11 rounded-xl w-full sm:w-auto">
                        {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileUp className="h-4 w-4 mr-2" />}
                        Import {previewData.length} Assets
                    </Button>
                </CardFooter>
             </Card>
         )
    }
    
    // Default 'upload' step
    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader>
                <Stepper steps={["Upload", "Map", "Preview"]} active={0} />
                <CardTitle className="pt-4">Bulk Import New Assets</CardTitle>
                <CardDescription>Upload a CSV file to add multiple new assets to your inventory. These assets will be marked as "Available".</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative rounded-xl border-2 border-dashed border-muted p-6 hover:border-primary transition cursor-pointer bg-muted/30">
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-3 text-center">
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">
                        Drag & drop CSV or <span className="text-primary">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                        Headers required • UTF-8 • .csv only
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const requiredAllotmentFields = [
    { key: "serialNumber", label: "Serial Number", required: true },
    { key: "name", label: "Allotted To (Name)", required: true, group: "allottedTo" },
    { key: "registrationNumber", label: "Registration Number", group: "allottedTo" },
    { key: "building", label: "Building", group: "allottedTo" },
    { key: "floor", label: "Floor", group: "allottedTo" },
    { key: "roomNumber", label: "Room Number", group: "allottedTo" },
    { key: "mobileNumber", label: "Contact No.", group: "allottedTo" },
    { key: "allotmentDate", label: "Issued Date" },
    { key: "status", label: "Status" },
    // For creating new assets
    { key: "model", label: "Model (for new assets)" },
    { key: "make", label: "Make (for new assets)" },
    { key: "assetNo", label: "Asset No (for new assets)" },
];


function BulkAllotmentCard({ setImportResults }: { setImportResults: (results: ImportResults | null) => void }) {
    const [step, setStep] = useState<'upload' | 'map' | 'validate' | 'confirm'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [allotmentsToUpdate, setAllotmentsToUpdate] = useState<any[]>([]);
    const [allotmentsForNewAssets, setAllotmentsForNewAssets] = useState<any[]>([]);

    const { toast } = useToast();
    const { data: assets, isLoading: isLoadingAssets } = useSWR<IAsset[]>('/api/inventory/assets?status=all', fetcher);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const csvHeaders = (results.meta.fields || []).filter(Boolean);
                    setHeaders(csvHeaders);

                    const autoMapping: Record<string, string> = {};
                    requiredAllotmentFields.forEach(field => {
                        const bestMatch = findBestHeaderMatch(field.key, csvHeaders);
                        if (bestMatch) autoMapping[field.key] = bestMatch;
                    });
                    setMapping(autoMapping);
                    
                    setParsedData(results.data);
                    setStep('map');
                },
            });
        }
    };
    
    const getTransformedData = () => {
        return parsedData.map(row => {
            const newRow: any = { allottedTo: {} };
            for (const field of requiredAllotmentFields) {
                const csvHeader = mapping[field.key];
                if (csvHeader && row[csvHeader] !== undefined) {
                    if (field.group === 'allottedTo') {
                        newRow.allottedTo[field.key] = row[csvHeader];
                    } else {
                        newRow[field.key] = row[csvHeader];
                    }
                }
            }
            return newRow;
        }).filter(row => row.serialNumber);
    };

    const handleConfirmMappingAndValidate = () => {
        const missingRequired = requiredAllotmentFields.some(f => f.required && !mapping[f.key]);
        if (missingRequired) {
            toast({ variant: 'destructive', title: 'Mapping Incomplete', description: 'Please map all required fields (*).' });
            return;
        }

        const transformedData = getTransformedData();
        if (!assets) return;
        
        const existingSerialNumbers = new Set(assets.map(a => String(a.serialNumber).toLowerCase()));
        const toUpdate = transformedData.filter(p => p.serialNumber && existingSerialNumbers.has(String(p.serialNumber).toLowerCase()));
        const toCreate = transformedData.filter(p => p.serialNumber && !existingSerialNumbers.has(String(p.serialNumber).toLowerCase()));
        
        setAllotmentsToUpdate(toUpdate);
        setAllotmentsForNewAssets(toCreate);
        setStep('validate');
    };

    const handleSubmit = async (createMissing: boolean) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/inventory/assets/bulk-allot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allotmentsToUpdate, allotmentsForNewAssets, createMissing }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || `Failed to process bulk allotment`);
            setImportResults({ message: result.message, successes: result.successes, failures: result.failures });
            mutate('/api/inventory/assets?status=all&sortKey=serialNumber&sortDirection=asc');
            mutate('/api/inventory/logs');
            resetState();
        } catch (error: any) {
            setImportResults({ message: "A critical error occurred during the import process.", successes: [], failures: [{ allotment: 'N/A', reason: error.message }] });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const resetState = () => {
        setFile(null);
        setParsedData([]);
        setHeaders([]);
        setMapping({});
        setAllotmentsToUpdate([]);
        setAllotmentsForNewAssets([]);
        setStep('upload');
    }

    if (step === 'map') {
         return (
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                     <Stepper steps={["Upload", "Map", "Validate & Import"]} active={1} />
                    <CardTitle className="pt-4">Map Allotment CSV Columns</CardTitle>
                    <CardDescription>Match your CSV columns to the allotment fields. This helps the system understand your file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {requiredAllotmentFields.map(field => (
                         <div key={field.key} className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:items-center sm:gap-4">
                             <Label htmlFor={`map-${field.key}`}>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
                             <Select value={mapping[field.key]} onValueChange={value => setMapping(prev => ({...prev, [field.key]: value}))}>
                                 <SelectTrigger id={`map-${field.key}`} className="h-11 rounded-lg"><SelectValue placeholder="Select CSV column..." /></SelectTrigger>
                                 <SelectContent>
                                     <SelectItem value="N/A">_Skip_</SelectItem>
                                     {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                 </SelectContent>
                             </Select>
                         </div>
                    ))}
                </CardContent>
                <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={resetState} className="h-11 rounded-xl w-full sm:w-auto">Back</Button>
                    <Button onClick={handleConfirmMappingAndValidate} disabled={isLoadingAssets} className="h-11 rounded-xl w-full sm:w-auto">
                         {isLoadingAssets ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                         Validate Data
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (step === 'validate') {
        return (
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                     <Stepper steps={["Upload", "Map", "Validate & Import"]} active={2} />
                    <CardTitle className="pt-4">Validation Complete</CardTitle>
                    <CardDescription>The system has compared your CSV against the current inventory.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base">Existing Assets to Update</CardTitle>
                            <Badge className="rounded-full px-3 py-1">{allotmentsToUpdate.length} records</Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">These assets were found in your inventory and will be updated with the new allotment information.</p>
                        </CardContent>
                    </Card>
                    <Card className={allotmentsForNewAssets.length > 0 ? "border-amber-500" : ""}>
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                {allotmentsForNewAssets.length > 0 && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                                New Assets Detected
                            </CardTitle>
                            <Badge variant={allotmentsForNewAssets.length > 0 ? "destructive" : "secondary"} className="rounded-full px-3 py-1">{allotmentsForNewAssets.length} records</Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                These serial numbers were not found. You can choose to create them as new assets during this import.
                            </p>
                            {allotmentsForNewAssets.length > 0 && (
                                <div className="relative max-h-40 w-full overflow-auto border rounded-md p-2 bg-muted/50 text-sm">
                                    <ul>{allotmentsForNewAssets.map((item, index) => <li key={index}>- {item.serialNumber} (for {item.allottedTo.name})</li>)}</ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </CardContent>
                <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" type="button" onClick={() => setStep('map')} className="h-11 rounded-xl w-full sm:w-auto">Back to Mapping</Button>
                    <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                        <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={isSubmitting} className="h-11 rounded-xl w-full sm:w-auto">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import Valid Only"}
                        </Button>
                        <Button onClick={() => handleSubmit(true)} disabled={isSubmitting || allotmentsForNewAssets.length === 0} className="h-11 rounded-xl w-full sm:w-auto">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4 mr-2" />}
                            Import & Create Missing
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        );
    }
    
    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader>
                <Stepper steps={["Upload", "Map", "Validate & Import"]} active={0} />
                <CardTitle className="pt-4">Bulk Allot Assets</CardTitle>
                <CardDescription>Upload a CSV to bulk-update asset allotments. The system matches assets using the Serial Number.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="relative rounded-xl border-2 border-dashed border-muted p-6 hover:border-primary transition cursor-pointer bg-muted/30">
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-3 text-center">
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">
                        Drag & drop CSV or <span className="text-primary">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                        Headers required • UTF-8 • .csv only
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


function ImportSummaryDialog({ isOpen, onClose, results }: { isOpen: boolean, onClose: () => void, results: ImportResults }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl rounded-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Summary</DialogTitle>
                    <DialogDescription>{results.message}</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="successes" className="mt-4 flex-1 flex flex-col min-h-0">
                    <TabsList>
                        <TabsTrigger value="successes">Successes ({results.successes.length})</TabsTrigger>
                        <TabsTrigger value="failures">Failures ({results.failures.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="successes" className="flex-1 min-h-0">
                        <div className="h-full overflow-y-auto mt-4 border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Serial Number</TableHead>
                                        <TableHead>Allotted To</TableHead>
                                        <TableHead>Location</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.successes.length > 0 ? (
                                        results.successes.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="whitespace-nowrap">{item.serialNumber}</TableCell>
                                                <TableCell className="whitespace-nowrap">{item.allottedTo}</TableCell>
                                                <TableCell className="whitespace-nowrap">{item.location}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground h-24">No successful imports to display.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="failures" className="flex-1 min-h-0">
                        <div className="h-full overflow-y-auto mt-4 border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Serial Number / Data</TableHead>
                                        <TableHead>Reason</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.failures.length > 0 ? (
                                        results.failures.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="whitespace-nowrap">{item.allotment?.serialNumber || JSON.stringify(item.allotment)}</TableCell>
                                                <TableCell className="text-destructive whitespace-pre-wrap">{item.reason}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground h-24">No failures.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button onClick={onClose} className="h-11 rounded-xl">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
