
'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Loader2, MailCheck } from 'lucide-react'

async function verifyOtp(email: string, otp: string): Promise<{ ok: boolean; error: string | null; token?: string }> {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  if (response.ok) {
    return { ok: true, error: null, token: data.token };
  } else {
    return { ok: false, error: data.message || 'An unknown error occurred.' };
  }
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const { toast } = useToast()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || otp.length < 6) return
    setIsLoading(true)
    
    try {
      const res = await verifyOtp(email, otp)
      
      if (res.ok) {
        toast({
          title: 'Email Verified!',
          description: "Let's set up your account.",
        })
        // Store the temporary token to proceed to onboarding
        localStorage.setItem('onboarding_token', res.token!);
        router.push('/onboarding')
      } else {
        throw new Error(res.error || 'An unknown error occurred.')
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!email) {
    return <div className="p-4 text-center text-destructive">Email parameter is missing. Please go back to the signup page.</div>;
  }

  return (
     <>
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <Card className="w-full max-w-md login-card-glow relative z-10">
          <CardHeader className="text-center">
             <CardTitle className="text-2xl">
              <div className="flex items-center justify-center gap-2">
                <MailCheck className="h-8 w-8 text-primary" />
                <span>Verify Your Email</span>
              </div>
            </CardTitle>
            <CardDescription>
              We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center">
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
              <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Verify & Proceed'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </>
  )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
