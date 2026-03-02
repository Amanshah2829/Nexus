

"use client"

import { useState, useMemo, useEffect, forwardRef, createRef } from "react";
import React from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDesc, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Wifi, CheckCircle, User, FileUp, Loader2, Save, FileDown, History, ArrowUpDown, Edit, Trash2, AlertTriangle, GitMerge, Info, Building, ChevronRight, Home, Camera, ShieldCheck, ShieldAlert, Shield, CameraOff, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IAsset } from "@/models/Asset";
import { IAssetLog, IDiscrepancy } from "@/models/AssetLog";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Label } from "@/components/ui/label";
import Papa from 'papaparse';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/app/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ITenant } from "@/models/Tenant";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IUser } from "@/app/models/User";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const assetStatuses: Record<IAsset['status'], { label: string; color: string }> = {
    available: { label: 'Available', color: 'bg-green-500/20 text-green-700' },
    allotted: { label: 'Allotted', color: 'bg-orange-500/20 text-orange-700' },
    replacement: { label: 'Replacement', color: 'bg-blue-500/20 text-blue-700' },
    defective: { label: 'Defective', color: 'bg-yellow-500/20 text-yellow-700' },
    damaged: { label: 'Damaged', color: 'bg-red-500/20 text-red-700' },
    other: { label: 'Other', color: 'bg-gray-500/20 text-gray-700' },
};

type ImportResults = {
    message: string;
    successes: any[];
    failures: any[];
};

export function InventoryContent() {
  const [selectedTab, setSelectedTab] = useState("assets");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportAssetDialogOpen, setIsImportAssetDialogOpen] = useState(false);
  const [isImportLogDialogOpen, setIsImportLogDialogOpen] = useState(false);
  const [isImportAllotmentDialogOpen, setIsImportAllotmentDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null);
  const { toast } = useToast();
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const { data: tenant } = useSWR<ITenant>('/api/tenants/me', fetcher);


  const handleAddAsset = async (formData: Partial<IAsset>) => {
    try {
      const response = await fetch("/api/inventory/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add asset");
      }
      toast({ title: "Success", description: "New asset added to inventory." });
      mutate("/api/inventory/assets?status=all&sortKey=serialNumber&sortDirection=asc");
      setIsAddDialogOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleUpdateAsset = async (assetId: string, formData: Partial<IAsset>) => {
    try {
      const response = await fetch(`/api/inventory/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update asset");
      }
      toast({ title: "Success", description: "Asset details updated." });
      mutate("/api/inventory/assets?status=all&sortKey=serialNumber&sortDirection=asc");
      mutate(`/api/inventory/logs?assetId=${assetId}`);
      setIsManageDialogOpen(false);
      setSelectedAsset(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };


  const handleImportAssets = async (importedAssets: Partial<IAsset>[]) => {
    try {
        const response = await fetch('/api/inventory/assets/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assets: importedAssets }),
        });

        const result = await response.json();

        if (!response.ok && response.status !== 207) {
            throw new Error(result.message || 'Failed to import assets');
        }

        setImportResults({
            message: result.message,
            successes: result.successes || [], 
            failures: result.failures || [],
        });

        mutate('/api/inventory/assets?status=all&sortKey=serialNumber&sortDirection=asc');
        setIsImportAssetDialogOpen(false);
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Import Error', description: err.message });
    }
};

const handleImportLogs = async (importedLogs: any[]) => {
    try {
        const response = await fetch('/api/inventory/logs/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logs: importedLogs }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to import logs');
        }

        toast({
            title: "Import Successful",
            description: result.message,
        });

        mutate('/api/inventory/logs');
        mutate('/api/inventory/assets?status=all&sortKey=serialNumber&sortDirection=asc');
        setIsImportLogDialogOpen(false);
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Import Error', description: err.message });
    }
};

const handleBulkAllotment = async (allotmentsToUpdate: any[], allotmentsForNewAssets: any[], createMissing: boolean) => {
    setIsImportAllotmentDialogOpen(false);

    try {
        const response = await fetch('/api/inventory/assets/bulk-allot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allotmentsToUpdate, allotmentsForNewAssets, createMissing }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to process bulk allotment`);
        }

        setImportResults({
            message: result.message,
            successes: result.successes,
            failures: result.failures,
        });

        mutate('/api/inventory/assets?status=all&sortKey=serialNumber&sortDirection=asc');
        mutate('/api/inventory/logs');

    } catch (error: any) {
         setImportResults({
            message: "A critical error occurred during the import process.",
            successes: [],
            failures: [{ allotment: 'N/A', reason: error.message }],
        });
    }
};


  const handleRowClick = (asset: IAsset) => {
    setSelectedAsset(asset);
    setIsManageDialogOpen(true);
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>
        <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setIsImportAssetDialogOpen(true)}>
                <FileUp className="h-4 w-4 mr-2" />
                Import Assets
            </Button>
             <Button variant="outline" onClick={() => setIsImportAllotmentDialogOpen(true)}>
                <FileUp className="h-4 w-4 mr-2" />
                Import Allotment
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
            </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="assets" className="flex-1 md:flex-initial">Asset List</TabsTrigger>
            <TabsTrigger value="logs" className="flex-1 md:flex-initial">Audit Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="assets" className="mt-6">
            <AssetListTab onRowClick={handleRowClick} />
          </TabsContent>
          <TabsContent value="logs" className="mt-6">
            <AssetLogTab onImportClick={() => setIsImportLogDialogOpen(true)} />
          </TabsContent>
      </Tabs>


      <AddAssetDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddAsset}
      />
       <ImportAssetDialog
        isOpen={isImportAssetDialogOpen}
        onClose={() => setIsImportAssetDialogOpen(false)}
        onImport={handleImportAssets}
      />
       <ImportLogDialog
        isOpen={isImportLogDialogOpen}
        onClose={() => setIsImportLogDialogOpen(false)}
        onImport={handleImportLogs}
      />
       <ImportAllotmentDialog
        isOpen={isImportAllotmentDialogOpen}
        onClose={() => setIsImportAllotmentDialogOpen(false)}
        onImport={handleBulkAllotment}
      />
      {selectedAsset && (
        <ManageAssetDialog
          isOpen={isManageDialogOpen}
          onClose={() => {
            setIsManageDialogOpen(false);
            setSelectedAsset(null);
          }}
          asset={selectedAsset}
          onUpdate={handleUpdateAsset}
          locations={tenant?.locations || []}
        />
      )}
      {importResults && (
        <ImportSummaryDialog
            isOpen={!!importResults}
            onClose={() => setImportResults(null)}
            results={importResults}
        />
      )}
    </div>
  );
}

function AssetListTab({ onRowClick }: { onRowClick: (asset: IAsset) => void }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortKey, setSortKey] = useState("serialNumber");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const isMobile = useIsMobile();
    
    const { data: assetsData, error, isLoading, mutate: mutateAssets } = useSWR<IAsset[]>('/api/inventory/assets?status=all&sortKey=serialNumber&sortDirection=asc', fetcher);
    const assets = assetsData || [];
    const { toast } = useToast();

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };
    
    const filteredAssets = useMemo(() => {
        let filtered = [...(assets || [])];

        if (filterStatus !== 'all') {
            filtered = filtered.filter(asset => asset.status === filterStatus);
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (asset) =>
                  (asset.serialNumber || '').toLowerCase().includes(lowerCaseQuery) ||
                  (asset.assetNo || '').toLowerCase().includes(lowerCaseQuery) ||
                  (asset.macAddress || '').toLowerCase().includes(lowerCaseQuery) ||
                  (asset.allottedTo?.name || '').toLowerCase().includes(lowerCaseQuery)
            );
        }

        return filtered.sort((a, b) => {
            const aVal = (a as any)[sortKey];
            const bVal = (b as any)[sortKey];
            if(sortKey === 'allottedTo.name') {
                 const aName = a.allottedTo?.name || '';
                 const bName = b.allottedTo?.name || '';
                 return sortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
            }
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [assets, searchQuery, filterStatus, sortKey, sortDirection]);

    const handleBulkDelete = async () => {
        try {
            const response = await fetch('/api/inventory/assets/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetIds: selectedAssets }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete assets');
            }
            toast({ title: "Success", description: `${selectedAssets.length} assets deleted.` });
            mutateAssets();
            setSelectedAssets([]);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    }


    const handleExportAssets = () => {
        if (!filteredAssets || filteredAssets.length === 0) {
          toast({
            title: "No Data",
            description: "There are no assets to export.",
            variant: "destructive",
          });
          return;
        }
    
        const dataToExport = filteredAssets.map(ext => ({
            assetNo: ext.assetNo,
            serialNumber: ext.serialNumber,
            make: ext.make,
            model: ext.model,
            macAddress: ext.macAddress,
            purchaseDate: ext.purchaseDate ? new Date(ext.purchaseDate).toLocaleDateString() : '',
            status: ext.status,
            complaintId: ext.complaintId,
            allotmentDate: ext.allotmentDate ? new Date(ext.allotmentDate).toLocaleDateString() : '',
            notes: ext.notes,
            allottedTo_name: ext.allottedTo?.name,
            allottedTo_email: ext.allottedTo?.email,
            allottedTo_registrationNumber: ext.allottedTo?.registrationNumber,
            allottedTo_mobileNumber: ext.allottedTo?.mobileNumber,
            allottedTo_building: ext.allottedTo?.building,
            allottedTo_floor: ext.allottedTo?.floor,
            allottedTo_roomNumber: ext.allottedTo?.roomNumber,
            allottedTo_course: ext.allottedTo?.course,
        }));
    
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `asset_inventory_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
            title: "Export Successful",
            description: `${filteredAssets.length} records have been exported.`,
        });
    };

    const stats = {
        total: assets?.length || 0,
        available: assets?.filter(e => e.status === 'available').length || 0,
        allotted: assets?.filter(e => e.status === 'allotted').length || 0,
    };
    
    const SortableHeader = ({ sortKeyName, children, className }: { sortKeyName: string; children: React.ReactNode, className?: string }) => (
        <TableHead onClick={() => handleSort(sortKeyName)} className={cn("cursor-pointer", className)}>
            <div className="flex items-center gap-2">
                {children}
                {sortKey === sortKeyName && <ArrowUpDown className="h-4 w-4" />}
            </div>
        </TableHead>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="glass-card">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Units</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <Wifi className="h-8 w-8 text-muted-foreground"/>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Available</p>
                            <p className="text-3xl font-bold text-green-500">{stats.available}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500"/>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Allotted</p>
                            <p className="text-3xl font-bold text-orange-500">{stats.allotted}</p>
                        </div>
                        <User className="h-8 w-8 text-orange-500"/>
                    </CardContent>
                </Card>
            </div>
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Asset List</CardTitle>
                        <Button variant="outline" size="sm" onClick={handleExportAssets}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export View
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search assets..."
                                    className="pl-10 w-full sm:w-64 md:w-80"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                             <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {Object.entries(assetStatuses).map(([key, {label}]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedAssets.length > 0 && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete ({selectedAssets.length})
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDesc>
                                        This action will permanently delete {selectedAssets.length} asset(s) and cannot be undone.
                                    </AlertDialogDesc>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBulkDelete}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isMobile ? (
                        <div className="space-y-4">
                            {(filteredAssets || []).map(asset => (
                                <Card key={asset._id} className="glass-card" onClick={() => onRowClick(asset)}>
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">{asset.serialNumber}</p>
                                                <p className="text-sm text-muted-foreground">{asset.assetNo}</p>
                                            </div>
                                            <Badge variant={"outline"} className={cn("text-xs", asset.status ? assetStatuses[asset.status]?.color : '')}>
                                                {asset.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm">Make/Model: {asset.make} {asset.model}</p>
                                        <p className="text-sm">Allotted to: {asset.allottedTo?.name || 'N/A'}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="relative w-full overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={filteredAssets && selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedAssets(filteredAssets?.map(a => a._id) || []);
                                                    } else {
                                                        setSelectedAssets([]);
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <SortableHeader sortKeyName="assetNo">Asset No.</SortableHeader>
                                        <SortableHeader sortKeyName="serialNumber">Serial Number</SortableHeader>
                                        <SortableHeader sortKeyName="make">Make & Model</SortableHeader>
                                        <TableHead>MAC Address</TableHead>
                                        <SortableHeader sortKeyName="status">Status</SortableHeader>
                                        <TableHead>Verification</TableHead>
                                        <SortableHeader sortKeyName="allottedTo.name">Allotted To</SortableHeader>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading && (
                                        <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24">
                                            <LoadingAnimation />
                                        </TableCell>
                                        </TableRow>
                                    )}
                                    {error && (
                                        <TableRow>
                                        <TableCell colSpan={9} className="text-center text-destructive">
                                            Failed to load inventory.
                                        </TableCell>
                                        </TableRow>
                                    )}
                                    {(filteredAssets || []).map((asset) => (
                                        <TableRow key={asset._id} data-state={selectedAssets.includes(asset._id) && "selected"}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedAssets.includes(asset._id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedAssets([...selectedAssets, asset._id]);
                                                        } else {
                                                            setSelectedAssets(selectedAssets.filter(id => id !== asset._id));
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{asset.assetNo}</TableCell>
                                            <TableCell className="font-medium">{asset.serialNumber}</TableCell>
                                            <TableCell>{asset.make || ''} {asset.model || ''}</TableCell>
                                            <TableCell>{asset.macAddress}</TableCell>
                                            <TableCell>
                                                <Badge variant={"outline"} className={cn("text-xs", asset.status ? assetStatuses[asset.status]?.color : '')}>
                                                    {asset.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <VerificationStatusBadge asset={asset} />
                                            </TableCell>
                                            <TableCell>{asset.allottedTo?.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onRowClick(asset); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


function AssetLogTab({ onImportClick }: { onImportClick: () => void }) {
    const { data: logs, error, isLoading } = useSWR<IAssetLog[]>("/api/inventory/logs", fetcher);
    const [searchQuery, setSearchQuery] = useState("");
    const isMobile = useIsMobile();

    const filteredLogs = logs?.filter(log =>
        ((log.asset as IAsset)?.serialNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details?.allottedTo?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details?.complaintId || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="glass-card">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Global Audit Logs</CardTitle>
                    <Button variant="outline" onClick={onImportClick}>
                        <FileUp className="h-4 w-4 mr-2" />
                        Import Logs
                    </Button>
                </div>
                 <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by S/N, User, or Complaint ID..."
                        className="pl-10 w-full md:max-w-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                {isMobile ? (
                    <div className="space-y-4">
                         {(filteredLogs || []).map((log) => (
                            <Card key={log._id} className="glass-card">
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{(log.asset as IAsset)?.serialNumber || 'N/A'}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                                        </div>
                                        <Badge variant={log.action === 'issued' ? 'destructive' : 'default'}>
                                            {log.action}
                                        </Badge>
                                    </div>
                                    <p className="text-sm">User: {log.user}</p>
                                    <p className="text-sm">Details: {log.details?.message || 'N/A'}</p>
                                </CardContent>
                            </Card>
                         ))}
                    </div>
                ) : (
                    <div className="relative w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Asset (S/N)</TableHead>
                                    <TableHead>Performed By</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead>Discrepancies</TableHead>
                                    <TableHead>Review</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24">
                                            <LoadingAnimation />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {error && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-destructive">
                                            Failed to load logs.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(filteredLogs || []).map((log) => (
                                    <TableRow key={log._id}>
                                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{(log.asset as any)?.serialNumber || 'N/A'}</TableCell>
                                        <TableCell>{log.user || 'N/A'}</TableCell>
                                        <TableCell>
                                            {log.action === 'verification' && (
                                                <Badge variant={log.verificationResult === 'FAIL' ? 'destructive' : log.verificationResult === 'PASS_WITH_OBSERVATION' ? 'secondary' : 'default'}>
                                                    {log.verificationResult}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{log.discrepancies?.length || 0}</TableCell>
                                        <TableCell>
                                            <Badge variant={log.reviewStatus === 'pending' ? 'secondary' : 'outline'}>{log.reviewStatus}</Badge>
                                        </TableCell>
                                        <TableCell>{log.details?.message || JSON.stringify(log.details)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
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



const initialFormData = {
    serialNumber: "",
    assetNo: "",
    make: "",
    model: "",
    macAddress: "",
    purchaseDate: "",
    location: "",
    department: "",
    purchaseOrderNumber: "",
    purchaseCost: "",
    vendor: "",
    warrantyEndDate: "",
};

function AddAssetDialog({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (data: Partial<IAsset>) => Promise<void> }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serialNumber) return;
    setIsSubmitting(true);
    const dataToSubmit: Partial<IAsset> & { purchaseCost?: number } = { ...formData };
    if (formData.purchaseCost) {
        dataToSubmit.purchaseCost = parseFloat(formData.purchaseCost);
    }
    await onAdd(dataToSubmit);
    setIsSubmitting(false);
    setFormData(initialFormData);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Enter the details for the new asset.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="assetNo">Asset Number</Label>
                    <Input id="assetNo" value={formData.assetNo} onChange={(e) => handleInputChange('assetNo', e.target.value)} placeholder="e.g., GNLU/22-23/IT/234"/>
                </div>
                <div>
                    <Label htmlFor="serialNumber">Serial Number <span className="text-destructive">*</span></Label>
                    <Input id="serialNumber" value={formData.serialNumber} onChange={(e) => handleInputChange('serialNumber', e.target.value)} placeholder="Unique serial number" required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="make">Make</Label>
                    <Input id="make" value={formData.make} onChange={(e) => handleInputChange('make', e.target.value)} placeholder="e.g., TP-Link, Dell"/>
                </div>
                <div>
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" value={formData.model} onChange={(e) => handleInputChange('model', e.target.value)} placeholder="e.g., RE300, Optiplex 7010"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="e.g., Main Campus, Server Room"/>
                </div>
                <div>
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} placeholder="e.g., IT, Accounts"/>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="macAddress">MAC Address</Label>
                    <Input id="macAddress" value={formData.macAddress} onChange={(e) => handleInputChange('macAddress', e.target.value)} placeholder="A1:B2:C3:D4:E5:F6"/>
                </div>
                 <div>
                    <Label htmlFor="purchaseOrderNumber">Purchase Order (PO) Number</Label>
                    <Input id="purchaseOrderNumber" value={formData.purchaseOrderNumber} onChange={(e) => handleInputChange('purchaseOrderNumber', e.target.value)} placeholder="e.g., PO-2024-0451"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="purchaseDate">Date of Purchase</Label>
                    <Input id="purchaseDate" type="date" value={formData.purchaseDate} onChange={(e) => handleInputChange('purchaseDate', e.target.value)} />
                </div>
                 <div>
                    <Label htmlFor="purchaseCost">Purchase Cost</Label>
                    <Input id="purchaseCost" type="number" value={formData.purchaseCost} onChange={(e) => handleInputChange('purchaseCost', e.target.value)} placeholder="e.g., 499.99"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input id="vendor" value={formData.vendor} onChange={(e) => handleInputChange('vendor', e.target.value)} placeholder="e.g., Local IT Supplier Inc."/>
                </div>
                <div>
                    <Label htmlFor="warrantyEndDate">Warranty End Date</Label>
                    <Input id="warrantyEndDate" type="date" value={formData.warrantyEndDate} onChange={(e) => handleInputChange('warrantyEndDate', e.target.value)} />
                </div>
            </div>
            <DialogFooter className="pt-4 sticky bottom-0 bg-background/95 pb-4">
                <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Add to Inventory
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


function ImportAssetDialog({ isOpen, onClose, onImport }: { isOpen: boolean, onClose: () => void, onImport: (data: Partial<IAsset>[]) => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Partial<IAsset>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
            const lower = header.toLowerCase().trim().replace(/[^a-z0-9]/gi, '');
            if (lower === 'modelno') return 'model';
            if (lower === 'serialno' || lower === 'srno') return 'serialNumber';
            if (lower === 'macaddress') return 'macAddress';
            if (lower === 'assetnumber') return 'assetNo';
            if (lower.startsWith('purchasedate')) return 'purchaseDate';
            return header;
        },
        transform: (value, header) => {
            if (header === 'macAddress' && (value.toUpperCase() === 'N/A' || value.toUpperCase() === 'NULL' || value.trim() === '')) {
                return undefined;
            }
            if (header === 'purchaseDate') {
                const parts = value.split(/[-/]/);
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10);
                    const year = parseInt(parts[2], 10);
                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                        return new Date(year, month - 1, day);
                    }
                }
            }
            return value;
        },
        complete: (results) => {
          const mappedData = results.data.map((row: any) => ({
            assetNo: row.assetNo,
            serialNumber: row.serialNumber,
            model: row.model,
            macAddress: row.macAddress,
            purchaseDate: row.purchaseDate,
            make: row.make
          }));
          setParsedData(mappedData as Partial<IAsset>[]);
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (parsedData.length === 0) return;
    setIsSubmitting(true);
    await onImport(parsedData);
    setIsSubmitting(false);
    setFile(null);
    setParsedData([]);
  };
  
  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    onClose();
  }

  const requiredHeaders = ["Model No.", "Serial No.", "Mac Address", "Asset Number", "Purchase Date(DD-MM-YYYY)"];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Assets from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with the required headers to bulk-add assets.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 border-dashed border-2 rounded-md">
            <p className="text-sm font-medium mb-2">CSV Format Requirements:</p>
            <p className="text-xs text-muted-foreground">
              Your file must be a CSV with the following headers (or similar variations):
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {requiredHeaders.map(h => <Badge key={h} variant="secondary">{h}</Badge>)}
            </div>
          </div>
          
          <Input type="file" accept=".csv" onChange={handleFileChange} />
          
          {parsedData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Preview ({parsedData.length} records found):</h3>
              <div className="relative max-h-60 overflow-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(parsedData[0]).map(header => <TableHead key={header}>{header}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((cell, i) => <TableCell key={i}>{cell instanceof Date ? cell.toLocaleDateString() : String(cell)}</TableCell>)}
                      </TableRow>
                    ))}
                    {parsedData.length > 5 && (
                        <TableRow>
                            <TableCell colSpan={Object.keys(parsedData[0]).length} className="text-center text-xs text-muted-foreground">
                                ...and {parsedData.length - 5} more rows.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || parsedData.length === 0}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileUp className="h-4 w-4 mr-2" />}
              Import {parsedData.length > 0 ? parsedData.length : ''} Records
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportLogDialog({ isOpen, onClose, onImport }: { isOpen: boolean, onClose: () => void, onImport: (data: any[]) => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (parsedData.length === 0) return;
    setIsSubmitting(true);
    await onImport(parsedData);
    setIsSubmitting(false);
    setFile(null);
    setParsedData([]);
  };
  
  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    onClose();
  }

  const requiredHeaders = ["assetSerialNumber", "action", "name", "email", "complaintId", "timestamp", "notes"];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Asset Logs from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with log entries. The system will match logs to assets using the serial number.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 border-dashed border-2 rounded-md">
            <p className="text-sm font-medium mb-2">CSV Format Requirements:</p>
            <p className="text-xs text-muted-foreground">
              Your file must be a CSV with headers. `assetSerialNumber` and `action` are required.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {requiredHeaders.map(h => <Badge key={h} variant="secondary">{h}</Badge>)}
            </div>
             <p className="text-xs text-muted-foreground mt-2">
              `action` must be one of: "created", "issued", "returned", "status_change", "updated". `timestamp` should be in a format recognized by JavaScript's `new Date()`.
            </p>
          </div>
          
          <Input type="file" accept=".csv" onChange={handleFileChange} />
          
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preview ({parsedData.length} records found):</h3>
              <div className="relative max-h-60 w-full overflow-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(parsedData[0]).map(header => <TableHead key={header}>{header}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((cell: any, i) => <TableCell key={i}>{String(cell)}</TableCell>)}
                      </TableRow>
                    ))}
                    {parsedData.length > 5 && (
                        <TableRow>
                            <TableCell colSpan={Object.keys(parsedData[0]).length} className="text-center text-xs text-muted-foreground">
                                ...and {parsedData.length - 5} more rows.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || parsedData.length === 0}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileUp className="h-4 w-4 mr-2" />}
              Import {parsedData.length > 0 ? parsedData.length : ''} Logs
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportAllotmentDialog({ isOpen, onClose, onImport }: { isOpen: boolean, onClose: () => void, onImport: (allotments: any[], createMissing: any[], create: boolean) => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationStep, setValidationStep] = useState(false);
  const [allotmentsToUpdate, setAllotmentsToUpdate] = useState<any[]>([]);
  const [allotmentsForNewAssets, setAllotmentsForNewAssets] = useState<any[]>([]);

  const { data: assets, isLoading: isLoadingAssets } = useSWR<IAsset[]>('/api/inventory/assets?status=all', fetcher);

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => {
                const lower = header.toLowerCase().trim().replace(/[^a-z0-9]/gi, '');
                if (lower === 'model' || lower === 'modelno') return 'model';
                if (lower === 'srno' || lower === 'serialnumber') return 'serialNumber';
                if (lower === 'macaddress') return 'macAddress';
                if (lower === 'name' || lower === 'allotedto') return 'name';
                if (lower === 'regno') return 'registrationNumber';
                if (lower === 'hostel' || lower === 'building') return 'building';
                if (lower === 'floor') return 'floor';
                if (lower === 'roomno') return 'roomNumber';
                if (lower === 'issueddate' || lower === 'allotmentdate') return 'allotmentDate';
                if (lower === 'contactno' || lower === 'mobilenumber') return 'mobileNumber';
                if (lower === 'status') return 'status';
                return lower;
            },
            complete: (results) => {
                const mappedData = results.data.map((row: any) => ({
                    serialNumber: row.serialNumber,
                    model: row.model,
                    macAddress: row.macAddress,
                    make: row.make,
                    assetNo: row.assetNo,
                    status: row.status || 'allotted',
                    allotmentDate: row.allotmentDate,
                    allottedTo: {
                        name: row.name,
                        registrationNumber: row.registrationNumber,
                        building: row.building,
                        floor: row.floor,
                        roomNumber: row.roomNumber,
                        mobileNumber: row.mobileNumber,
                    },
                }));
                setParsedData(mappedData);
            },
        });
    }
};
  
  const handleValidate = () => {
    if (!assets) return;
    const existingSerialNumbers = new Set(assets.map(a => a.serialNumber.toLowerCase()));
    const toUpdate = parsedData.filter(p => p.serialNumber && existingSerialNumbers.has(p.serialNumber.toLowerCase()));
    const toCreate = parsedData.filter(p => p.serialNumber && !existingSerialNumbers.has(p.serialNumber.toLowerCase()));
    
    setAllotmentsToUpdate(toUpdate);
    setAllotmentsForNewAssets(toCreate);
    setValidationStep(true);
  }

  const handleSubmit = async (createMissing: boolean) => {
    setIsSubmitting(true);
    await onImport(allotmentsToUpdate, allotmentsForNewAssets, createMissing);
    handleClose();
  };
  
  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setIsSubmitting(false);
    setValidationStep(false);
    setAllotmentsToUpdate([]);
    setAllotmentsForNewAssets([]);
    onClose();
  }

  const requiredHeaders = ["SR No.", "Alloted To", "Reg No", "Building", "Floor", "Room No", "Issued Date", "Contact No.", "Status"];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Allotments from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV to bulk-update asset allotments. The system will match assets using the Serial Number.
          </DialogDescription>
        </DialogHeader>
        {!validationStep ? (
            <div className="space-y-4">
            <div className="p-4 border-dashed border-2 rounded-md">
                <p className="text-sm font-medium mb-2">CSV Format Requirements:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                {requiredHeaders.map(h => <Badge key={h} variant="secondary">{h}</Badge>)}
                </div>
            </div>
            
            <Input type="file" accept=".csv" onChange={handleFileChange} />
            
            {parsedData.length > 0 && (
                <div className="space-y-2">
                <h3 className="text-sm font-medium">Preview ({parsedData.length} records found):</h3>
                <div className="relative max-h-60 w-full overflow-auto border rounded-md">
                    <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead>Serial Number</TableHead>
                          <TableHead>Allotted To</TableHead>
                          <TableHead>Building</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parsedData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{row.serialNumber}</TableCell>
                            <TableCell>{row.allottedTo.name}</TableCell>
                            <TableCell>{row.allottedTo.building}</TableCell>
                            <TableCell>{row.allottedTo.roomNumber}</TableCell>
                            <TableCell>{row.status}</TableCell>
                        </TableRow>
                        ))}
                         {parsedData.length > 5 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                                    ...and {parsedData.length - 5} more rows.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
                </div>
            )}

            <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleValidate} disabled={isLoadingAssets || parsedData.length === 0}>
                {isLoadingAssets ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Validate Data
                </Button>
            </DialogFooter>
            </div>
        ) : (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Validation Complete</h3>
                <p className="text-sm text-muted-foreground">The system has compared the file against the current inventory.</p>

                <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base">Existing Assets to Update</CardTitle>
                        <Badge variant="default">{allotmentsToUpdate.length} records</Badge>
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
                        <Badge variant={allotmentsForNewAssets.length > 0 ? "destructive" : "secondary"}>{allotmentsForNewAssets.length} records</Badge>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground mb-4">
                            These serial numbers were not found in your inventory. You can choose to create them as new assets during this import.
                        </p>
                        {allotmentsForNewAssets.length > 0 && (
                            <div className="relative max-h-40 w-full overflow-auto border rounded-md p-2 bg-muted/50 text-sm">
                                <ul>
                                    {allotmentsForNewAssets.map((item, index) => (
                                        <li key={index}>- {item.serialNumber} (for {item.allottedTo.name})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <DialogFooter className="pt-4 sm:justify-between flex-col-reverse sm:flex-row gap-2">
                    <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import Valid Only"}
                        </Button>
                        <Button onClick={() => handleSubmit(true)} disabled={isSubmitting || allotmentsForNewAssets.length === 0}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4 mr-2"/>}
                            Import & Create Missing
                        </Button>
                    </div>
                </DialogFooter>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


function ManageAssetDialog({ isOpen, onClose, asset, onUpdate, locations }: { isOpen: boolean, onClose: () => void, asset: IAsset, onUpdate: (id: string, data: Partial<IAsset>) => Promise<void>, locations: string[] }) {
    const [formData, setFormData] = useState({
      ...asset,
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      allotmentDate: asset.allotmentDate ? new Date(asset.allotmentDate).toISOString().split('T')[0] : '',
      warrantyEndDate: asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toISOString().split('T')[0] : '',
      purchaseCost: asset.purchaseCost || 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleInputChange = (field: string, value: string | number) => {
        if (field.startsWith('allottedTo.')) {
            const subField = field.split('.')[1];
            setFormData(prev => ({
              ...prev,
              allottedTo: { ...(prev.allottedTo || {}), [subField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      await onUpdate(asset._id, formData);
      setIsSubmitting(false);
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md md:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Asset: {asset.serialNumber}</DialogTitle>
            <DialogDescription>
              Update the status and details for this asset.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Asset Details</TabsTrigger>
                    <TabsTrigger value="purchase">Purchase Info</TabsTrigger>
                    <TabsTrigger value="allotment">Allotment</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="assetNo">Asset Number</Label>
                            <Input id="assetNo" value={formData.assetNo || ''} onChange={(e) => handleInputChange('assetNo', e.target.value)}/>
                        </div>
                        <div>
                            <Label htmlFor="serialNumber">Serial Number</Label>
                            <Input id="serialNumber" value={formData.serialNumber} onChange={(e) => handleInputChange('serialNumber', e.target.value)} required/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="make">Make</Label>
                            <Input id="make" value={formData.make || ''} onChange={(e) => handleInputChange('make', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="model">Model</Label>
                            <Input id="model" value={formData.model || ''} onChange={(e) => handleInputChange('model', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={formData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="e.g., Main Campus, Server Room"/>
                        </div>
                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" value={formData.department || ''} onChange={(e) => handleInputChange('department', e.target.value)} placeholder="e.g., IT, Accounts"/>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Input id="notes" value={formData.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} />
                    </div>
                </TabsContent>
                <TabsContent value="purchase" className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="purchaseOrderNumber">Purchase Order (PO) Number</Label>
                            <Input id="purchaseOrderNumber" value={formData.purchaseOrderNumber || ''} onChange={(e) => handleInputChange('purchaseOrderNumber', e.target.value)}/>
                        </div>
                        <div>
                            <Label htmlFor="vendor">Vendor</Label>
                            <Input id="vendor" value={formData.vendor || ''} onChange={(e) => handleInputChange('vendor', e.target.value)}/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="purchaseDate">Date of Purchase</Label>
                            <Input id="purchaseDate" type="date" value={formData.purchaseDate} onChange={(e) => handleInputChange('purchaseDate', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="purchaseCost">Purchase Cost</Label>
                            <Input id="purchaseCost" type="number" value={formData.purchaseCost} onChange={(e) => handleInputChange('purchaseCost', e.target.valueAsNumber)} />
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="warrantyEndDate">Warranty End Date</Label>
                        <Input id="warrantyEndDate" type="date" value={formData.warrantyEndDate} onChange={(e) => handleInputChange('warrantyEndDate', e.target.value)} />
                    </div>
                </TabsContent>
                <TabsContent value="allotment" className="pt-4 space-y-4">
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(assetStatuses).map(([key, {label}]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.status === 'allotted' && (
                        <div className="p-4 border rounded-md space-y-4 bg-muted/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="allottedToName">Allotted To (Name)</Label>
                                    <Input id="allottedToName" value={formData.allottedTo?.name || ''} onChange={(e) => handleInputChange('allottedTo.name', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="registrationNumber">Registration Number</Label>
                                    <Input id="registrationNumber" value={formData.allottedTo?.registrationNumber || ''} onChange={(e) => handleInputChange('allottedTo.registrationNumber', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="allottedToEmail">Allotted To (Email)</Label>
                                    <Input id="allottedToEmail" type="email" value={formData.allottedTo?.email || ''} onChange={(e) => handleInputChange('allottedTo.email', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                                    <Input id="mobileNumber" value={formData.allottedTo?.mobileNumber || ''} onChange={(e) => handleInputChange('allottedTo.mobileNumber', e.target.value)} />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="building">Building</Label>
                                    <Select value={formData.allottedTo?.building || ''} onValueChange={(v) => handleInputChange('allottedTo.building', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select building" /></SelectTrigger>
                                        <SelectContent>
                                             {locations.map(location => (
                                                <SelectItem key={location} value={location}>{location}</SelectItem>
                                             ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="floor">Floor</Label>
                                    <Select value={formData.allottedTo?.floor || ''} onValueChange={(v) => handleInputChange('allottedTo.floor', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Floor" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GF">Ground Floor (GF)</SelectItem>
                                            <SelectItem value="FF">First Floor (FF)</SelectItem>
                                            <SelectItem value="SF">Second Floor (SF)</SelectItem>
                                            <SelectItem value="TF">Third Floor (TF)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="roomNumber">Room Number</Label>
                                    <Input id="roomNumber" value={formData.allottedTo?.roomNumber || ''} onChange={(e) => handleInputChange('allottedTo.roomNumber', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="course">Course</Label>
                                <Select value={formData.allottedTo?.course || ''} onValueChange={(v) => handleInputChange('allottedTo.course', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LLB">LLB</SelectItem>
                                        <SelectItem value="LLM">LLM</SelectItem>
                                        <SelectItem value="MBA">MBA</SelectItem>
                                        <SelectItem value="PHD">PHD</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="complaintId">Complaint ID</Label>
                                    <Input id="complaintId" value={formData.complaintId || ''} onChange={(e) => handleInputChange('complaintId', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="allotmentDate">Allotment Date</Label>
                                    <Input id="allotmentDate" type="date" value={formData.allotmentDate} onChange={(e) => handleInputChange('allotmentDate', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="history" className="pt-4">
                    <AssetHistoryViewer assetId={asset._id}/>
                </TabsContent>
            </Tabs>
            

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

function ImportSummaryDialog({ isOpen, onClose, results }: { isOpen: boolean, onClose: () => void, results: ImportResults }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Import Summary</DialogTitle>
                    <DialogDescription>{results.message}</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="successes" className="mt-4">
                    <TabsList>
                        <TabsTrigger value="successes">Successes ({results.successes.length})</TabsTrigger>
                        <TabsTrigger value="failures">Failures ({results.failures.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="successes">
                        <div className="max-h-80 overflow-y-auto mt-4 border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Serial Number</TableHead>
                                        <TableHead>Asset No.</TableHead>
                                        <TableHead>Model</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.successes.length > 0 ? (
                                        results.successes.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.serialNumber}</TableCell>
                                                <TableCell>{item.assetNo}</TableCell>
                                                <TableCell>{item.model}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground h-24">No successful imports to display.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="failures">
                        <div className="max-h-80 overflow-y-auto mt-4 border rounded-md">
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
                                                <TableCell>{item.asset?.serialNumber || JSON.stringify(item.asset)}</TableCell>
                                                <TableCell className="text-destructive whitespace-pre-wrap">{item.reason}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground h-24">No failures.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AssetLogViewer({ logs, isLoading, error }: { logs?: IAssetLog[], isLoading: boolean, error: any }) {
    if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    if (error) return <div className="text-destructive p-4">Failed to load asset history.</div>;
    if (!logs || logs.length === 0) return <div className="text-center text-muted-foreground p-4">No history for this asset.</div>;
  
    return (
      <div className="space-y-4">
        {logs.map(log => (
          <div key={log._id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="bg-muted rounded-full p-2">
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="w-px flex-1 bg-border" />
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium">{log.action}</p>
              <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()} by {log.user || 'System'}</p>
              <p className="text-sm mt-1">{log.details?.message}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

function AssetHistoryViewer({ assetId }: { assetId: string }) {
    const { data: logs, error, isLoading } = useSWR<IAssetLog[]>(`/api/inventory/logs?assetId=${assetId}`, fetcher);
    return <AssetLogViewer logs={logs} error={error} isLoading={isLoading} />;
}
