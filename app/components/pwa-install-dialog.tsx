
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePWAInstallStore } from "@/app/lib/store"
import { usePWAInstall } from "@/components/pwa-install-provider"
import { CheckCircle, Download, Loader2, ServerCrash, XCircle } from "lucide-react"

export function PWAInstallDialog() {
  const { isInstallDialogOpen, closeInstallDialog } = usePWAInstallStore();
  const { canInstall, status, error, promptToInstall } = usePWAInstall();

  const handleInstallClick = () => {
    promptToInstall();
  };

  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className="text-center space-y-4 py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h3 className="text-xl font-semibold">App Installed</h3>
          <p className="text-muted-foreground">The application has been successfully installed on your device. You can now launch it from your home screen.</p>
        </div>
      );
    }

    if (status === 'installing') {
        return (
            <div className="text-center space-y-4 py-8">
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                <h3 className="text-xl font-semibold">Installing...</h3>
                <p className="text-muted-foreground">Please follow the instructions in the browser prompt to complete the installation.</p>
            </div>
        )
    }
    
    if (status === 'failed' || status === 'unsupported') {
      return (
        <div className="text-center space-y-4 py-8">
          <ServerCrash className="h-16 w-16 text-destructive mx-auto" />
          <h3 className="text-xl font-semibold">Installation Failed</h3>
          <p className="text-muted-foreground">The app could not be installed at this time.</p>
          {error && <p className="text-sm bg-destructive/10 text-destructive p-3 rounded-md">{error}</p>}
        </div>
      );
    }
    
    if (canInstall) {
        return (
             <div className="text-center space-y-4 py-8">
                <Download className="h-16 w-16 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Install Application</h3>
                <p className="text-muted-foreground">Install this application on your device for a better experience, including offline access and faster loading.</p>
                <Button onClick={handleInstallClick} size="lg">
                    Install App
                </Button>
            </div>
        )
    }

    return (
      <div className="text-center space-y-4 py-8">
        <XCircle className="h-16 w-16 text-destructive mx-auto" />
        <h3 className="text-xl font-semibold">Not Installable</h3>
        <p className="text-muted-foreground">
          This app cannot be installed right now. This might be because it's already installed, you're not using a compatible browser, or the installation criteria are not met.
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isInstallDialogOpen} onOpenChange={closeInstallDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Installation</DialogTitle>
          <DialogDescription>
            Manage the PWA installation for Vynsec Nexus.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
        <DialogFooter>
          <Button variant="outline" onClick={closeInstallDialog}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
