'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, ShieldCheck, Mail, MailCheck } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

async function signIn(email: string, password: string): Promise<{ ok: boolean; status: number; error: string | null }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    return { ok: true, status: response.status, error: null };
  } else {
    return { ok: false, status: response.status, error: data.message || 'An unknown error occurred.' };
  }
}

async function forgotPassword(email: string): Promise<{ ok: boolean; error: string | null }> {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    return { ok: true, error: null };
  } else {
    const data = await response.json();
    return { ok: false, error: data.message || 'An unknown error occurred.' };
  }
}

async function resendVerification(email: string): Promise<{ ok: boolean; error: string | null }> {
    const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    if (response.ok) {
        return { ok: true, error: null };
    } else {
        const data = await response.json();
        return { ok: false, error: data.message || 'Failed to resend OTP.' };
    }
}

async function verifyOtp(email: string, otp: string): Promise<{ ok: boolean; error: string | null }> {
    const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });

    if (response.ok) {
        return { ok: true, error: null };
    } else {
        const data = await response.json();
        return { ok: false, error: data.message || 'An unknown error occurred.' };
    }
}


export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [showSignupDisabledMessage, setShowSignupDisabledMessage] = useState(false);

  // State for OTP verification dialog
  const [isVerifyEmailOpen, setIsVerifyEmailOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);


  useEffect(() => {
    if (searchParams.get('signup') === 'disabled') {
      setShowSignupDisabledMessage(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const res = await signIn(email, password)
      
      if (res.ok) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        })
        router.push('/')
        router.refresh()
      } else {
        if (res.status === 403 && res.error?.includes('Account not verified')) {
             setIsVerifyEmailOpen(true);
        } else {
            throw new Error(res.error || 'An unknown error occurred.');
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingReset(true)

    try {
      const res = await forgotPassword(forgotPasswordEmail)
      if (res.ok) {
        toast({
          title: 'Email Sent',
          description: 'If an account with that email exists, a new password has been sent.',
        })
        setIsForgotPasswordOpen(false)
        setForgotPasswordEmail('')
      } else {
        throw new Error(res.error || 'An unknown error occurred.')
      }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Request Failed',
            description: error.message,
        })
    } finally {
        setIsSendingReset(false)
    }
  }
  
    const handleOtpVerification = async () => {
        setIsVerifying(true);
        try {
            const res = await verifyOtp(email, otp);
            if (res.ok) {
                toast({
                    title: 'Email Verified!',
                    description: 'Your account is now active. Please log in again to continue.',
                });
                setIsVerifyEmailOpen(false);
                setOtp('');
            } else {
                throw new Error(res.error || 'Invalid OTP.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
        } finally {
            setIsVerifying(false);
        }
    };
    
    const handleResendOtp = async () => {
        setIsResending(true);
        try {
            const res = await resendVerification(email);
            if (res.ok) {
                toast({ title: 'OTP Sent', description: 'A new OTP has been sent to your email address.' });
            } else {
                throw new Error(res.error || 'Failed to resend OTP.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsResending(false);
        }
    };


  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <Card className="w-full max-w-sm login-card-glow relative z-10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <span>Vynsec Nexus</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSignupDisabledMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    Public sign-up is currently disabled.
                  </AlertDescription>
                </Alert>
              )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background/50 backdrop-blur-sm"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => setIsForgotPasswordOpen(true)}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background/50 backdrop-blur-sm"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Login'
                )}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline hover:text-primary transition-colors">
                Sign up for a free trial
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />

      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we&apos;ll send you a new temporary password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="your.email@university.edu"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                disabled={isSendingReset}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSendingReset}>
              {isSendingReset ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Password
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isVerifyEmailOpen} onOpenChange={setIsVerifyEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              Your account is not verified. An OTP has been sent to <strong>{email}</strong>. Please enter it below.
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-4">
                <div className="flex justify-center py-4">
                    <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                    </InputOTP>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="w-full" onClick={handleResendOtp} disabled={isResending}>
                        {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                        Resend OTP
                    </Button>
                    <Button className="w-full" onClick={handleOtpVerification} disabled={isVerifying || otp.length < 6}>
                         {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4 mr-2" />}
                        Verify Email
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
