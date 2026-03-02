"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Star, Edit } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"


export function CustomerConfirmation({ resolutionStatus, onNext, onBack }: { resolutionStatus?: string; onNext: (data: any) => void; onBack: () => void; }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [rating, setRating] = useState(0);
  const [mobileNumber, setMobileNumber] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);

  // Drawing logic
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): { x: number, y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e.nativeEvent) { // Touch event
        if (e.nativeEvent.touches.length > 0) {
            return {
                x: e.nativeEvent.touches[0].clientX - rect.left,
                y: e.nativeEvent.touches[0].clientY - rect.top,
            };
        }
    } else { // Mouse event
        return {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
        };
    }
    return null;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoords(e);
    if (!coords) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.strokeStyle = "#000000" // Ensure color is set
        ctx.lineWidth = 2
        setIsDrawing(true);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoords(e);
    if (!coords) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        // Check if canvas is empty
        const blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;
        if (canvas.toDataURL() === blank.toDataURL()) {
            return; // Do nothing if signature is empty
        }
        setSignatureData(canvas.toDataURL());
        setIsSignatureDialogOpen(false);
    }
  }

  const handleNext = () => {
    onNext({
        mobileNumber,
        rating,
        signature: signatureData
    })
  }

  // Effect to initialize canvas when dialog opens
  useEffect(() => {
    if (isSignatureDialogOpen) {
        setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
        }, 100); // Small delay to ensure canvas is in the DOM
    }
  }, [isSignatureDialogOpen]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Step 8: User Confirmation</CardTitle>
          <CardDescription>Please have the user verify the work and provide their signature.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {resolutionStatus === 'resolved' && (
              <div className="p-4 border rounded-md bg-muted/50">
                  <h3 className="font-semibold mb-2">User Verification Checklist</h3>
                  <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2"><Checkbox id="verify-resolved" /> <Label htmlFor="verify-resolved">Issue has been resolved to my satisfaction.</Label></div>
                      <div className="flex items-center gap-2"><Checkbox id="verify-next-steps" /> <Label htmlFor="verify-next-steps">Next steps have been clearly explained (if any).</Label></div>
                      <div className="flex items-center gap-2"><Checkbox id="verify-performance" /> <Label htmlFor="verify-performance">System performance is back to normal.</Label></div>
                  </div>
              </div>
          )}
          <div className="space-y-2">
              <Label htmlFor="user-mobile">User Mobile Number (for OTP if needed)</Label>
              <Input id="user-mobile" placeholder="Enter mobile for confirmation..." value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>User Signature</Label>
            {signatureData ? (
                <div className="border rounded-md p-2 flex items-center justify-between bg-muted/50">
                    <img src={signatureData} alt="User signature" className="h-16 bg-white rounded" />
                    <Button variant="outline" size="sm" onClick={() => setIsSignatureDialogOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Recapture
                    </Button>
                </div>
            ) : (
                <Button variant="outline" className="w-full" onClick={() => setIsSignatureDialogOpen(true)}>
                    Capture Signature
                </Button>
            )}
          </div>
          <div className="space-y-2">
              <Label>User Rating (Optional)</Label>
              <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          onClick={() => setRating(star)}
                      />
                  ))}
              </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button onClick={handleNext} disabled={!signatureData}>Complete Visit</Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Signature Dialog */}
      <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provide Signature</DialogTitle>
          </DialogHeader>
          <div className="py-4">
             <div className="relative border-2 border-dashed rounded-md bg-white touch-none">
                  <canvas
                      ref={canvasRef}
                      width={500}
                      height={200}
                      className="cursor-crosshair w-full"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                  />
              </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={clearCanvas}>Clear</Button>
            <Button type="button" onClick={confirmSignature}>Confirm Signature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
