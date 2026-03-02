
"use client"

import React, { useState, useMemo, useEffect, createRef } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Camera, ShieldCheck, ShieldAlert, Building, ChevronRight, Loader2, Save, CameraOff, Upload, User, Phone, AlertTriangle, ArrowRight, XCircle, CheckCircle, UserX, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IAsset } from "@/models/Asset";
import { IDiscrepancy } from "@/models/AssetLog";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/app/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Alert, AlertTitle } from "./ui/alert";


const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AssetVerificationContent() {
  const { data: assetsData, error, isLoading, mutate } = useSWR<IAsset[]>(
    "/api/inventory/assets?status=all",
    fetcher
  );

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const allAssets = useMemo(() => assetsData || [], [assetsData]);

  const locations = useMemo(() => {
    const locs = [
      ...new Set(allAssets.map((a) => a.allottedTo?.building).filter(Boolean)),
    ].map((loc) => ({
      name: loc!,
      count: allAssets.filter((a) => a.allottedTo?.building === loc).length,
    }));
    const unlocatedCount = allAssets.filter(
      (a) => !a.allottedTo?.building
    ).length;
    if (unlocatedCount > 0) {
      locs.push({ name: "In Stock / Unlocated", count: unlocatedCount });
    }
    return locs;
  }, [allAssets]);

  const devices = useMemo(() => {
    if (!selectedLocation) return [];
    if (selectedLocation === "In Stock / Unlocated") {
      return allAssets.filter((a) => !a.allottedTo?.building);
    }
    return allAssets.filter((a) => a.allottedTo?.building === selectedLocation);
  }, [allAssets, selectedLocation]);

  const breadcrumbs = useMemo(
    () => [
      { name: "All Locations", action: () => setSelectedLocation(null) },
      ...(selectedLocation ? [{ name: selectedLocation, action: null }] : []),
    ],
    [selectedLocation]
  );
  
  if (isLoading) return <div className="p-6"><LoadingAnimation /></div>;
  if (error)
    return (
      <div className="p-6 text-destructive">
        Failed to load asset data for verification.
      </div>
    );
  
  const handleAssetClick = (asset: IAsset) => {
    setSelectedAsset(asset);
    setIsSurveyOpen(true);
  };
  
  const handleSurveyClose = () => {
    setIsSurveyOpen(false);
    setSelectedAsset(null);
    mutate(); // revalidate asset data after verification
  }

  const handleBack = () => {
      setSelectedLocation(null);
  };


  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Asset Verification</h1>
        <p className="text-muted-foreground">Physically verify assets by location to ensure inventory accuracy and compliance.</p>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.name}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <button
                    onClick={crumb.action || undefined}
                    disabled={!crumb.action}
                    className={cn(!crumb.action && "font-medium text-foreground", crumb.action && "hover:underline")}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
             {selectedLocation && <Button variant="outline" onClick={handleBack}>Back</Button>}
          </div>
        </CardHeader>
        <CardContent>
          {!selectedLocation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {locations.map(loc => (
                <Card key={loc.name} className="hover:bg-accent/50 cursor-pointer" onClick={() => setSelectedLocation(loc.name)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Building className="h-6 w-6 text-muted-foreground"/>
                       <div>
                          <p className="font-semibold">{loc.name}</p>
                          <p className="text-sm text-muted-foreground">{loc.count} devices</p>
                       </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedLocation && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map(device => (
                    <Card key={device._id} className="hover:bg-accent/50 cursor-pointer" onClick={() => handleAssetClick(device)}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-base">
                                <span>SN: {device.serialNumber}</span>
                                <VerificationStatusBadge asset={device} />
                            </CardTitle>
                             <CardDescription>
                                {device.make} {device.model}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-1">
                            {device.allottedTo?.name ? (
                                <>
                                    <p><strong>User:</strong> {device.allottedTo.name}</p>
                                    <p><strong>Room:</strong> {device.allottedTo.roomNumber}</p>
                                </>
                            ): (
                                <p><strong>Location:</strong> In Stock / {device.location}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
          )}

        </CardContent>
      </Card>
      {selectedAsset && (
        <VerificationSurveyDialog
            isOpen={isSurveyOpen}
            onClose={handleSurveyClose}
            asset={selectedAsset}
        />
      )}
    </div>
  );
}

function VerificationStatusBadge({ asset }: { asset: IAsset }) {
    if (!asset.lastVerifiedAt) {
        return <Badge variant="secondary">Never Verified</Badge>
    }
    const validUntil = new Date(asset.verificationValidUntil!);
    const now = new Date();
    const daysUntilExpiry = (validUntil.getTime() - now.getTime()) / (1000 * 3600 * 24);

    if (daysUntilExpiry < 0) {
        return <Badge variant="destructive" className="flex items-center gap-1"><ShieldAlert className="h-3 w-3"/> Expired</Badge>
    }
    if (daysUntilExpiry < 30) {
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 flex items-center gap-1"><ShieldAlert className="h-3 w-3"/> Expiring Soon</Badge>
    }
    return <Badge variant="default" className="bg-green-500/20 text-green-700 flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> Verified</Badge>
}

type VerificationStep = 'location' | 'condition' | 'evidence' | 'summary' | 'missing_asset' | 'damaged_asset' | 'location_mismatch';

function VerificationSurveyDialog({ asset, isOpen, onClose }: { asset: IAsset; isOpen: boolean; onClose: () => void; }) {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<VerificationStep>('location');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = createRef<HTMLVideoElement>();
  const fileInputRef = React.createRef<HTMLInputElement>();
  const [cameraStatus, setCameraStatus] = React.useState<'loading' | 'active' | 'error'>('loading');

  const [surveyData, setSurveyData] = useState({
    locationStatus: '', // 'found', 'missing'
    condition: '', // 'good', 'damaged'
    userPresent: '', // 'yes', 'no'
    locationMatch: '', // 'yes', 'no'
    newLocation: { building: asset.allottedTo?.building || '', room: asset.allottedTo?.roomNumber || '' },
    damageNotes: '',
    photo: null as string | null,
    finalNotes: '',
  });

  const handleDataChange = (field: string, value: any) => {
    setSurveyData(prev => {
        const keys = field.split('.');
        if (keys.length > 1) {
            return {
                ...prev,
                [keys[0]]: {
                    ...(prev as any)[keys[0]],
                    [keys[1]]: value,
                },
            };
        }
        return { ...prev, [field]: value };
    });
  };

  const resetState = () => {
    setStep('location');
    setSurveyData({
        locationStatus: '', condition: '', userPresent: '', locationMatch: '',
        newLocation: { building: asset.allottedTo?.building || '', room: asset.allottedTo?.roomNumber || '' },
        damageNotes: '', photo: null, finalNotes: ''
    });
  }

  // Camera permission and cleanup logic
  useEffect(() => {
    if (isOpen && step === 'evidence') {
        let stream: MediaStream | null = null;
        
        const getCameraPermission = async () => {
            setCameraStatus('loading');
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            } catch (err) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                } catch (finalErr) {
                    console.error("Could not access any camera:", finalErr);
                    setCameraStatus('error');
                    return; 
                }
            }
            setCameraStatus('active');
            if (videoRef.current) videoRef.current.srcObject = stream;
        };

        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }
  }, [isOpen, step, videoRef]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => handleDataChange('photo', reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => fileInputRef.current?.click();
  
  const takePicture = () => {
    if (cameraStatus !== 'active' || !videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    handleDataChange('photo', canvas.toDataURL("image/jpeg", 0.9));
  };

  const raiseTicket = async (title: string, description: string, priority: 'medium' | 'high' = 'medium') => {
      try {
        const response = await fetch('/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title, description, priority,
                reporter: 'System (Asset Verification)', reporterEmail: 'system@nexus.com',
                building: asset.allottedTo?.building || 'Unknown', room: asset.allottedTo?.roomNumber || 'Unknown'
            }),
        });
        if (!response.ok) throw new Error('Failed to create ticket.');
        const newComplaint = await response.json();
        toast({ title: 'Ticket Raised', description: `Complaint ${newComplaint.id} has been created.`});
        router.push('/complaints'); // Navigate to complaints to see the new ticket
        onClose();
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
  }

    const handleRaiseDamageTicket = async () => {
        setIsSubmitting(true);
        // 1. Update asset status to 'damaged'
        await fetch(`/api/inventory/assets/${asset._id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: 'damaged', notes: `Damaged during verification: ${surveyData.damageNotes}` }),
        });
        // 2. Raise ticket
        await raiseTicket(`Damage Report for Asset: ${asset.serialNumber}`, `The following damage was observed during a physical asset verification:\n\nAsset No: ${asset.assetNo}\nSerial: ${asset.serialNumber}\n\nDamage Description:\n${surveyData.damageNotes}`, 'high');
        setIsSubmitting(false);
    }

    const handleRaiseMissingTicket = async () => {
        setIsSubmitting(true);
        await raiseTicket(`Missing Asset Report: ${asset.serialNumber}`, `Asset with Serial Number ${asset.serialNumber} was reported missing during a verification check at its last known location.\n\nLast known user: ${asset.allottedTo?.name}\nLast known location: ${asset.allottedTo?.building}, Room ${asset.allottedTo?.roomNumber}`, 'high');
        setIsSubmitting(false);
    }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const discrepancies: IDiscrepancy[] = [];
    if (surveyData.locationMatch === 'no') discrepancies.push({ type: "LOCATION_MISMATCH", severity: "MEDIUM", description: `Asset found at ${surveyData.newLocation.building} - ${surveyData.newLocation.room} instead of ${asset.allottedTo?.building} - ${asset.allottedTo?.roomNumber}` });
    if (surveyData.condition === 'damaged') discrepancies.push({ type: "DAMAGED", severity: "HIGH", description: surveyData.damageNotes || "Asset physically damaged." });
    
    let verificationResult: 'PASS' | 'PASS_WITH_OBSERVATION' | 'FAIL' = 'PASS';
    if (discrepancies.length > 0) {
        verificationResult = 'PASS_WITH_OBSERVATION';
    }
    
    setIsSubmitting(true);
    try {
      let finalAssetData: Partial<IAsset> = {};
      if (surveyData.locationMatch === 'no') {
          finalAssetData.allottedTo = { ...asset.allottedTo, building: surveyData.newLocation.building, roomNumber: surveyData.newLocation.room };
      }
      if(Object.keys(finalAssetData).length > 0){
        await fetch(`/api/inventory/assets/${asset._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(finalAssetData) });
      }

      const payload = {
        notes: surveyData.finalNotes, photo: surveyData.photo,
        verificationResult, discrepancies
      };

      const res = await fetch(`/api/inventory/assets/${asset._id}/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Failed to submit verification');

      toast({ title: 'Verification Submitted', description: 'The asset verification has been logged.' });
      onClose();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const expectedLocation = asset.allottedTo?.name 
            ? `Allotted to ${asset.allottedTo.name} in ${asset.allottedTo.building}, Room ${asset.allottedTo.roomNumber}`
            : `In Stock / located at "${asset.location || 'Unknown Location'}"`;
    
    switch(step) {
      case 'location':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-md border">
              <Label className="text-xs text-muted-foreground">Expected Location</Label>
              <p className="font-medium">{expectedLocation}</p>
            </div>
            <div>
              <Label>Is the asset physically present at this location?</Label>
              <RadioGroup value={surveyData.locationStatus} onValueChange={v => handleDataChange('locationStatus', v)} className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Label htmlFor="loc-found" className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:border-primary">
                    <RadioGroupItem value="found" id="loc-found" className="sr-only" />
                    <CheckCircle className="w-8 h-8 mb-2 text-green-500"/>
                    <span className="font-semibold">Asset Present</span>
                    <span className="text-xs text-muted-foreground text-center">Continue the verification process.</span>
                </Label>
                <Label htmlFor="loc-missing" className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:border-destructive">
                    <RadioGroupItem value="missing" id="loc-missing" className="sr-only" />
                    <XCircle className="w-8 h-8 mb-2 text-destructive"/>
                    <span className="font-semibold">Asset Missing</span>
                    <span className="text-xs text-muted-foreground text-center">The asset was not found at this location.</span>
                </Label>
              </RadioGroup>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={() => setStep(surveyData.locationStatus === 'found' ? 'condition' : 'missing_asset')} disabled={!surveyData.locationStatus}>Next <ArrowRight className="h-4 w-4 ml-2"/></Button>
            </DialogFooter>
          </div>
        )
      case 'missing_asset':
        return (
             <div className="space-y-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Asset Missing</AlertTitle>
                </Alert>
                <p className="text-sm text-muted-foreground">The asset was not found at its last known location. You should raise a ticket to investigate.</p>
                <Card>
                    <CardHeader><CardTitle className="text-base">Last Known Details</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>User:</strong> {asset.allottedTo?.name || 'N/A'}</p>
                        <p><strong>Contact:</strong> {asset.allottedTo?.mobileNumber || 'N/A'}</p>
                        <p><strong>Location:</strong> {asset.allottedTo?.building || 'N/A'} - {asset.allottedTo?.roomNumber || 'N/A'}</p>
                    </CardContent>
                </Card>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setStep('location')}>Back</Button>
                    <Button variant="destructive" onClick={handleRaiseMissingTicket} disabled={isSubmitting}>
                         {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2"/>}
                        Raise Missing Asset Ticket
                    </Button>
                </DialogFooter>
             </div>
        )
      case 'condition':
        return (
          <div className="space-y-6">
             <div>
              <Label>What is the asset's physical condition?</Label>
              <RadioGroup value={surveyData.condition} onValueChange={v => handleDataChange('condition', v)} className="mt-2 grid grid-cols-2 gap-4">
                <Label htmlFor="cond-good" className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:border-primary"><RadioGroupItem value="good" id="cond-good" className="sr-only" /><CheckCircle className="w-8 h-8 mb-2 text-green-500"/><span className="font-semibold">Good</span></Label>
                <Label htmlFor="cond-damaged" className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:border-destructive"><RadioGroupItem value="damaged" id="cond-damaged" className="sr-only" /><AlertTriangle className="w-8 h-8 mb-2 text-destructive"/><span className="font-semibold">Damaged</span></Label>
              </RadioGroup>
            </div>
             <div>
              <Label>Is the user present?</Label>
              <RadioGroup value={surveyData.userPresent} onValueChange={v => handleDataChange('userPresent', v)} className="mt-2 grid grid-cols-2 gap-4">
                <Label htmlFor="user-yes" className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:border-primary"><RadioGroupItem value="yes" id="user-yes" className="sr-only" /><User className="w-8 h-8 mb-2 text-primary"/><span className="font-semibold">User Present</span></Label>
                <Label htmlFor="user-no" className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:border-amber-500"><RadioGroupItem value="no" id="user-no" className="sr-only" /><UserX className="w-8 h-8 mb-2 text-amber-500"/><span className="font-semibold">User Not Available</span></Label>
              </RadioGroup>
            </div>
             {surveyData.userPresent === 'no' && (
                 <Card>
                    <CardHeader className="flex-row items-center gap-3 space-y-0">
                        <User className="h-5 w-5"/>
                        <CardTitle className="text-base">Last Allotted User</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p><strong>Name:</strong> {asset.allottedTo?.name}</p>
                        <p><strong>Contact:</strong> {asset.allottedTo?.mobileNumber || 'Not available'}</p>
                    </CardContent>
                </Card>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setStep('location')}>Back</Button>
                <Button onClick={() => setStep(surveyData.condition === 'damaged' ? 'damaged_asset' : 'location_mismatch')} disabled={!surveyData.condition || !surveyData.userPresent}>Next <ArrowRight className="h-4 w-4 ml-2"/></Button>
            </DialogFooter>
          </div>
        )
      case 'damaged_asset':
         return (
             <div className="space-y-4">
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Asset Damaged</AlertTitle>
                </Alert>
                <p className="text-sm text-muted-foreground">Please describe the damage and raise a ticket. This will update the asset's status to 'Damaged'.</p>
                <Textarea value={surveyData.damageNotes} onChange={e => handleDataChange('damageNotes', e.target.value)} placeholder="Describe the damage (e.g., cracked screen, broken port)..." required />
                <DialogFooter>
                    <Button variant="outline" onClick={() => setStep('condition')}>Back</Button>
                    <Button variant="destructive" onClick={handleRaiseDamageTicket} disabled={isSubmitting || !surveyData.damageNotes}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                        Raise Damage Report Ticket
                    </Button>
                </DialogFooter>
             </div>
         )
      case 'location_mismatch':
        return (
            <div className="space-y-6">
                 <div>
                    <Label>Is the asset's location correct as per records?</Label>
                     <RadioGroup value={surveyData.locationMatch} onValueChange={v => handleDataChange('locationMatch', v)} className="mt-2 grid grid-cols-2 gap-4">
                        <Label htmlFor="loc-match-yes" className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:border-primary"><RadioGroupItem value="yes" id="loc-match-yes" className="sr-only" /><CheckCircle className="w-8 h-8 mb-2 text-green-500"/><span className="font-semibold">Yes, Location Correct</span></Label>
                        <Label htmlFor="loc-match-no" className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent/50 has-[[data-state=checked]]:border-amber-500"><RadioGroupItem value="no" id="loc-match-no" className="sr-only" /><AlertTriangle className="w-8 h-8 mb-2 text-amber-500"/><span className="font-semibold">No, Location Mismatch</span></Label>
                    </RadioGroup>
                 </div>
                 {surveyData.locationMatch === 'no' && (
                     <Card>
                         <CardHeader><CardTitle className="text-base">Update Location</CardTitle></CardHeader>
                         <CardContent className="space-y-2">
                             <Input placeholder="New Building" value={surveyData.newLocation.building} onChange={e => handleDataChange('newLocation.building', e.target.value)} />
                             <Input placeholder="New Room Number" value={surveyData.newLocation.room} onChange={e => handleDataChange('newLocation.room', e.target.value)} />
                         </CardContent>
                     </Card>
                 )}
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setStep('condition')}>Back</Button>
                    <Button onClick={() => setStep('evidence')} disabled={!surveyData.locationMatch}>Next <ArrowRight className="h-4 w-4 ml-2"/></Button>
                </DialogFooter>
            </div>
        )
      case 'evidence':
        const needsPhoto = surveyData.condition === 'damaged' || surveyData.locationMatch === 'no';
        return (
          <div className="space-y-4">
              <Label>Evidence Capture {needsPhoto && <span className="text-destructive">(Mandatory)</span>}</Label>
              <div className="relative w-full aspect-video rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                {cameraStatus === 'active' && !surveyData.photo && (<video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />)}
                {cameraStatus === 'loading' && (<div className="flex flex-col items-center gap-2 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin"/><span>Starting Camera...</span></div>)}
                {cameraStatus === 'error' && !surveyData.photo && (
                    <div className="text-center text-destructive p-4">
                        <CameraOff className="h-8 w-8 mx-auto mb-2"/>
                        <p className="font-semibold">Camera Not Available</p>
                        <p className="text-xs">Please use the upload option.</p>
                    </div>
                )}
                {surveyData.photo && (<img src={surveyData.photo} alt="Verification" className="absolute inset-0 w-full h-full object-contain p-1"/>)}
              </div>

              <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                      <Button type="button" onClick={takePicture} disabled={cameraStatus !== 'active' || isSubmitting}>
                        {cameraStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin"/> : <Camera className="h-4 w-4" />} 
                        <span className="ml-2">{surveyData.photo ? 'Retake' : 'Capture'}</span>
                      </Button>
                      <Button type="button" variant="outline" onClick={triggerFileUpload} disabled={isSubmitting}>
                          <Upload className="h-4 w-4 mr-2"/>
                          Upload Image
                      </Button>
                  </div>
                  {surveyData.photo && (<Button type="button" variant="link" size="sm" className="w-full text-muted-foreground" onClick={() => handleDataChange('photo', null)}>Clear Image</Button>)}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('location_mismatch')}>Back</Button>
                <Button onClick={() => setStep('summary')} disabled={needsPhoto && !surveyData.photo}>Next <ArrowRight className="h-4 w-4 ml-2"/></Button>
              </DialogFooter>
          </div>
        )
       case 'summary':
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Verification Summary</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <div className="flex justify-between"><span>Asset Found:</span> <Badge variant={surveyData.locationStatus === 'found' ? 'default' : 'destructive'} className="capitalize">{surveyData.locationStatus}</Badge></div>
                             <div className="flex justify-between"><span>Condition:</span> <Badge variant={surveyData.condition === 'good' ? 'default' : 'destructive'} className="capitalize">{surveyData.condition}</Badge></div>
                             <div className="flex justify-between"><span>Location Correct:</span> <Badge variant={surveyData.locationMatch === 'yes' ? 'default' : 'secondary'} className="capitalize">{surveyData.locationMatch}</Badge></div>
                        </CardContent>
                    </Card>
                    {surveyData.photo && (
                        <div><Label>Evidence Photo</Label><img src={surveyData.photo} alt="Evidence" className="mt-1 rounded-md border aspect-video object-cover w-full" /></div>
                    )}
                    <div><Label htmlFor="final-notes">Final Notes / Remarks</Label><Textarea id="final-notes" value={surveyData.finalNotes} onChange={e => handleDataChange('finalNotes', e.target.value)} placeholder="Add any final summary or observations here..." /></div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setStep('evidence')}>Back</Button>
                      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2"/>}Submit Verification</Button>
                    </DialogFooter>
                </form>
            )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { resetState(); onClose(); }}}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Asset Verification: {asset.serialNumber}</DialogTitle>
          <DialogDescription>
            Follow the steps to log the physical status and location of this asset.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4 max-h-[80vh] overflow-y-auto pr-4">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

