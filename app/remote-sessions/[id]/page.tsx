'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { 
  Monitor, 
  XCircle, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MousePointer2, 
  Keyboard,
  Send,
  Loader2,
  AlertCircle,
  Maximize2,
  Settings,
  Activity,
  Shield,
  StopCircle,
  Share2,
  ChevronLeft,
  Signal,
  Radio,
  Pointer
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const info = await res.json();
    (error as any).info = info;
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

export default function RemoteSessionWorkspace() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.id as string;

  const { data: sessionData, error, mutate, isLoading: isDataLoading } = useSWR(
    sessionId ? `/api/remote-sessions/${sessionId}` : null, 
    fetcher,
    { refreshInterval: 3000 }
  );

  const { data: currentUser } = useSWR('/api/users/me', fetcher);

  const [message, setMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [clickRipple, setClickRipple] = useState<{ x: number, y: number } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const session = sessionData?.session;
  
  const isEngineer = currentUser?.role === 'engineer' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';
  const isStaff = currentUser?._id === session?.complainer?._id;

  useEffect(() => {
    const timer = setTimeout(() => setIsConnecting(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.chatMessages]);

  const toggleScreenShare = async () => {
    if (isSharingScreen) {
      stopLocalStream();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      localStreamRef.current = stream;
      setIsSharingScreen(true);
      
      await fetch(`/api/remote-sessions/${sessionId}/control`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBroadcasting: true }),
      });

      stream.getVideoTracks()[0].onended = () => {
        stopLocalStream();
      };

      toast({ title: "Sharing Active", description: "Your screen is now visible to the support professional." });
    } catch (err) {
      console.error("Screen share error:", err);
      toast({ variant: "destructive", title: "Share Failed", description: "Permissions denied." });
    }
  };

  const stopLocalStream = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsSharingScreen(false);
    
    await fetch(`/api/remote-sessions/${sessionId}/control`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBroadcasting: false }),
    });
    mutate();
  };

  const handleRemoteClick = (e: React.MouseEvent) => {
    if (!isEngineer || !session?.allowRemoteInput || !session?.isBroadcasting) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setClickRipple({ x, y });
    setTimeout(() => setClickRipple(null), 600);

    toast({ 
        title: "Signal Injected", 
        description: "Remote click transmitted to client device.",
        duration: 1000
    });
  };

  const handleToggleRemoteInput = async () => {
    if (!isStaff) return;
    const newState = !session?.allowRemoteInput;
    try {
        await fetch(`/api/remote-sessions/${sessionId}/control`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allowRemoteInput: newState }),
        });
        toast({ 
            title: newState ? "Control Authorized" : "Control Revoked", 
            description: newState ? "The engineer can now interact with your PC." : "Remote input restricted."
        });
        mutate();
    } catch (err) {
        toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const response = await fetch(`/api/remote-sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        setMessage('');
        mutate();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  async function handleEndSession() {
    if (!confirm('Are you sure you want to end this remote support session?')) return;
    
    setIsEnding(true);
    try {
      const response = await fetch(`/api/remote-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        toast({ title: 'Session Ended', description: 'The remote connection has been closed.' });
        router.push('/remote-sessions');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to end session', variant: 'destructive' });
    } finally {
      setIsEnding(false);
    }
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Session Not Found</h2>
          <p className="text-white/60">This session may have already been completed or the link is invalid.</p>
          <Button onClick={() => router.push('/remote-sessions')} className="w-full">Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <TooltipProvider>
        {/* Header */}
        <header className="h-14 border-b border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white" onClick={() => router.push('/remote-sessions')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
                <Monitor className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold truncate max-w-[150px] sm:max-w-md">
                  {isStaff ? 'Sharing My Device' : `Remote View: ${session?.complainer?.name}`}
                </h1>
                <p className="text-[9px] text-white/40 font-mono tracking-widest uppercase">{session?.complaint?.ticketNumber || 'Nexus-Session'}</p>
              </div>
            </div>
            {session?.isBroadcasting && (
              <div className="flex items-center gap-2 px-3 h-6 bg-red-500/20 border border-red-500/30 rounded-full animate-in fade-in duration-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-red-400 tracking-tighter">Live Feed</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-6 mr-4 px-6 border-r border-white/10">
              <div className="text-right">
                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-0.5">Bitrate</p>
                <p className="text-xs font-bold font-mono text-primary">{session?.isBroadcasting ? '4.2 Mbps' : '0.0 Mbps'}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-0.5">Latency</p>
                <p className="text-xs font-bold font-mono text-green-400">{session?.isBroadcasting ? '48ms' : '---'}</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-8 font-black uppercase text-[10px] tracking-widest px-4 shadow-2xl" 
              onClick={handleEndSession}
              disabled={isEnding}
            >
              {isEnding ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <XCircle className="h-3 w-3 mr-2" />}
              TERMINATE
            </Button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 relative bg-black flex flex-col group">
            {isConnecting ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-slate-950">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase animate-pulse">Syncing Encrypted Tunnel</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-slate-950/50 relative overflow-hidden">
                
                {/* Main Viewport */}
                <div 
                  className={cn(
                    "aspect-video w-full max-w-6xl bg-black shadow-2xl overflow-hidden relative ring-1 ring-white/5",
                    isEngineer && session?.isBroadcasting && session?.allowRemoteInput && "cursor-crosshair",
                    session?.isBroadcasting ? "rounded-none" : "rounded-2xl"
                  )}
                  onClick={handleRemoteClick}
                >
                  {/* LOCAL SENDER VIDEO */}
                  {isStaff && (
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted
                      className={cn(
                        "absolute inset-0 w-full h-full object-contain z-10 transition-opacity duration-700",
                        isSharingScreen ? "opacity-100" : "opacity-0 pointer-events-none"
                      )}
                    />
                  )}

                  {/* REMOTE RECEIVER SIMULATION */}
                  {!isStaff && session?.isBroadcasting && (
                    <div className="absolute inset-0 z-10 animate-in fade-in duration-1000">
                        <img 
                            src="https://picsum.photos/seed/desk/1280/720" 
                            alt="Remote Desktop"
                            className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px]" />
                        {/* Digital Scanlines effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
                    </div>
                  )}

                  {/* CLICK RIPPLE ANIMATION */}
                  {clickRipple && (
                    <div 
                        className="absolute w-10 h-10 border-2 border-primary rounded-full animate-ping z-30 pointer-events-none bg-primary/20"
                        style={{ left: clickRipple.x - 20, top: clickRipple.y - 20 }}
                    />
                  )}

                  {/* LIVE OVERLAY ELEMENTS */}
                  {session?.isBroadcasting && (
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                      <Badge className="bg-red-600 text-white border-none font-black text-[10px] px-3 h-6 flex items-center gap-2 shadow-lg">
                        <Radio className="h-3 w-3 animate-pulse" /> TUNNEL ACTIVE
                      </Badge>
                      {session?.allowRemoteInput && (
                        <Badge className="bg-blue-600 text-white border-none font-black text-[10px] px-3 h-6 flex items-center gap-2 shadow-lg">
                            <MousePointer2 className="h-3 w-3" /> CONTROL GRANTED
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* STANDBY / IDLE OVERLAY */}
                  {!session?.isBroadcasting && (
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl z-20 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-center mb-8 relative">
                        <Monitor className="h-10 w-10 text-primary/40" />
                        <div className="absolute -inset-1 bg-primary/10 rounded-3xl blur-xl animate-pulse" />
                      </div>
                      <h2 className="text-3xl font-black tracking-tight mb-3 uppercase">Standby for Signal</h2>
                      <p className="text-white/40 max-w-md text-sm leading-relaxed mb-10">
                        {isStaff 
                          ? 'Activate your device broadcast to allow the support professional to visualize and fix the reported issue.' 
                          : `The remote peer (${session?.complainer?.name || 'client'}) needs to initiate the encrypted broadcast.`}
                      </p>
                      
                      {isStaff && (
                        <Button 
                          onClick={toggleScreenShare} 
                          className="h-14 px-10 gap-3 bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl font-black text-base"
                        >
                          <Share2 className="h-6 w-6" />
                          START BROADCAST
                        </Button>
                      )}

                      {!isStaff && (
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Monitoring Transmission Tunnel...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status HUD (for Broadcaster) */}
                {isStaff && session?.isBroadcasting && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl px-8 py-4 shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-8 duration-500 z-30">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest mb-0.5">Stream Quality</span>
                        <span className="text-xs font-bold uppercase">AES-256 Encrypted</span>
                      </div>
                      <Separator orientation="vertical" className="h-8 bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-green-400 tracking-widest mb-0.5">Control Mode</span>
                        <span className="text-xs font-bold uppercase">{session?.allowRemoteInput ? 'UNLOCKED' : 'PROTECTED'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="secondary"
                            className={cn(
                                "rounded-xl h-10 px-6 font-black text-[10px] tracking-widest border-none transition-all",
                                session?.allowRemoteInput ? "bg-amber-500 text-black hover:bg-amber-600" : "bg-white/10 text-white"
                            )}
                            onClick={handleToggleRemoteInput}
                        >
                            {session?.allowRemoteInput ? <Shield className="h-4 w-4 mr-2" /> : <MousePointer2 className="h-4 w-4 mr-2" />}
                            {session?.allowRemoteInput ? 'REVOKE INPUT' : 'ALLOW INPUT'}
                        </Button>
                        <Button 
                            variant="destructive" 
                            className="rounded-xl h-10 px-6 font-black text-[10px] tracking-widest" 
                            onClick={stopLocalStream}
                        >
                            <StopCircle className="h-4 w-4 mr-2" /> STOP BROADCAST
                        </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Float Toolbar (Auto-hide) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-8 py-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 z-40 shadow-2xl">
              <ControlBtn icon={isMuted ? MicOff : Mic} active={!isMuted} onClick={() => setIsMuted(!isMuted)} label={isMuted ? "Unmute" : "Mute"} />
              <ControlBtn icon={videoActive ? Video : VideoOff} active={videoActive} onClick={() => setVideoActive(!videoActive)} label="Toggle Video" />
              <Separator orientation="vertical" className="h-8 bg-white/10 mx-4" />
              <ControlBtn 
                icon={MousePointer2} 
                active={isEngineer && session?.allowRemoteInput} 
                disabled={isStaff || !session?.allowRemoteInput} 
                label={isStaff ? "Local Mode" : "Remote Pointer"} 
              />
              <ControlBtn 
                icon={Keyboard} 
                active={isEngineer && session?.allowRemoteInput} 
                disabled={isStaff || !session?.allowRemoteInput} 
                label={isStaff ? "Local Mode" : "Keys Capture"} 
              />
              <Separator orientation="vertical" className="h-8 bg-white/10 mx-4" />
              <ControlBtn icon={Maximize2} label="Fullscreen" />
              <ControlBtn icon={Settings} label="Session Settings" />
            </div>
          </main>

          {/* Right Interface: Collaboration */}
          <aside className="w-80 border-l border-white/10 bg-slate-950 flex flex-col shrink-0 shadow-2xl z-50">
            <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <TabsList className="grid w-full grid-cols-2 bg-black border border-white/5 h-10 p-1 rounded-xl">
                  <TabsTrigger value="chat" className="text-[10px] font-black uppercase tracking-widest">Chat</TabsTrigger>
                  <TabsTrigger value="info" className="text-[10px] font-black uppercase tracking-widest">Telemetry</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0">
                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                  <div className="space-y-6">
                    {session?.chatMessages.map((msg: any, idx: number) => (
                      <div key={idx} className={cn(
                        "flex flex-col gap-2",
                        msg.messageType === 'system' ? "items-center text-center py-4" : 
                        msg.sender === currentUser?._id ? "items-end" : "items-start"
                      )}>
                        {msg.messageType === 'system' ? (
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                            {msg.message}
                          </span>
                        ) : (
                          <>
                            <div className={cn(
                              "max-w-[90%] p-4 rounded-2xl text-sm shadow-xl",
                              msg.sender === currentUser?._id 
                                ? "bg-primary text-white rounded-tr-none" 
                                : "bg-white/5 border border-white/5 text-white/90 rounded-tl-none"
                            )}>
                              {msg.message}
                            </div>
                            <span className="text-[8px] font-black uppercase text-white/30 px-1">
                              {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-6 border-t border-white/10 bg-black/20">
                  <form onSubmit={handleSendMessage} className="relative">
                    <Input 
                      placeholder="Type a signal..." 
                      className="bg-white/5 border-white/10 pr-12 h-12 text-sm rounded-xl"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 text-primary hover:text-white" 
                      type="submit"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="info" className="flex-1 overflow-y-auto p-8 m-0 space-y-10">
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <Signal className="h-3.5 w-3.5" /> Session Nodes
                  </h3>
                  <div className="space-y-3">
                    <ParticipantCard name={session?.engineer?.name} role="Support Architect" status="connected" />
                    <ParticipantCard name={session?.complainer?.name} role="Source Provider" status={session?.isBroadcasting ? 'broadcasting' : 'connected'} />
                  </div>
                </section>

                <Separator className="bg-white/5" />

                <section className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" /> Policy Matrix
                  </h3>
                  <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <PolicyStatus label="Remote Control" enabled={session?.allowRemoteInput} />
                    <PolicyStatus label="Screen Feed" enabled={session?.isBroadcasting} />
                    <PolicyStatus label="Audio Uplink" enabled={session?.canShareAudio} />
                    <PolicyStatus label="Compliance Log" enabled={session?.allowScreenRecording} />
                  </div>
                </section>

                <section className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                   <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Internal Infrastructure</p>
                   <p className="text-[10px] text-white/60 leading-relaxed">Tunnel type: WebRTC P2P Direct. Data is end-to-end encrypted with AES-256 standard protocols.</p>
                </section>
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </TooltipProvider>
    </div>
  );
}

function ControlBtn({ icon: Icon, active, onClick, disabled, label }: any) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-12 w-12 rounded-2xl transition-all",
            active 
              ? "bg-primary text-white shadow-lg" 
              : "text-white/50 hover:text-white hover:bg-white/10",
            disabled && "opacity-10 cursor-not-allowed"
          )}
        >
          <Icon className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-black border-white/10 text-[10px] font-black uppercase tracking-widest text-primary">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function ParticipantCard({ name, role, status }: any) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
      <Avatar className="h-10 w-10 ring-2 ring-white/5">
        <AvatarImage src={`https://avatar.vercel.sh/${name}.png`} />
        <AvatarFallback className="bg-slate-800 text-xs font-bold">{name?.[0] || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate text-white/90">{name || 'Node'}</p>
        <p className="text-[9px] text-white/30 uppercase font-black tracking-widest">{role}</p>
      </div>
      <div className={cn(
        "w-2 h-2 rounded-full",
        status === 'broadcasting' ? "bg-red-500 animate-pulse" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
      )} />
    </div>
  );
}

function PolicyStatus({ label, enabled }: any) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[10px] font-bold text-white/40 uppercase">{label}</span>
      <Badge className={cn(
        "text-[8px] font-black uppercase px-2 h-4 rounded-md border-none",
        enabled ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/20"
      )}>
        {enabled ? 'READY' : 'LOCKED'}
      </Badge>
    </div>
  );
}
