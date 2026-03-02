
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Loader2, Building, ArrowRight, ShieldCheck } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

async function completeOnboarding(formData: any, token: string): Promise<{ ok: boolean; error: string | null }> {
  const response = await fetch('/api/tenants/onboard', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    return { ok: true, error: null };
  } else {
    const data = await response.json();
    return { ok: false, error: data.message || 'An unknown error occurred.' };
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tenantName: '',
    industry: '',
    companySize: '',
    address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'IN'
    }
  });
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const storedToken = localStorage.getItem('onboarding_token');
    if (!storedToken) {
        toast({ title: "Error", description: "No session token found. Please sign up again.", variant: 'destructive'});
        router.push('/signup');
    } else {
        setToken(storedToken);
    }
  }, [router, toast]);

  const handleInputChange = (path: string, value: string) => {
    setFormData(prev => {
        const keys = path.split('.');
        if (keys.length === 1) {
            return { ...prev, [keys[0]]: value };
        } else {
             return { ...prev, [keys[0]]: { ...(prev as any)[keys[0]], [keys[1]]: value } };
        }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return;
    setIsLoading(true)
    
    try {
      const res = await completeOnboarding(formData, token)
      
      if (res.ok) {
        toast({
          title: 'Account Created!',
          description: "Welcome! You will now be logged in.",
        })
        localStorage.removeItem('onboarding_token');
        router.push('/') // The backend will set the session cookie, so a redirect to login should work.
        router.refresh();
      } else {
        throw new Error(res.error || 'An unknown error occurred.')
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Onboarding Failed',
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-black p-4">
        <Card className="w-full max-w-2xl login-card-glow relative z-10">
          <CardHeader className="text-center">
             <CardTitle className="text-2xl">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <span>One Last Step</span>
              </div>
            </CardTitle>
            <CardDescription>Tell us a bit about your organization to start your free trial.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="tenantName">Organization Name</Label>
                <Input
                  id="tenantName"
                  value={formData.tenantName}
                  onChange={(e) => handleInputChange('tenantName', e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" value={formData.industry} onChange={e => handleInputChange('industry', e.target.value)} disabled={isLoading} className="bg-background/50 backdrop-blur-sm"/>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="companySize">Organization Size</Label>
                     <Select value={formData.companySize} onValueChange={v => handleInputChange('companySize', v)} disabled={isLoading}>
                         <SelectTrigger className="bg-background/50 backdrop-blur-sm"><SelectValue placeholder="Select size..." /></SelectTrigger>
                         <SelectContent>
                             <SelectItem value="1-10">1-10 employees</SelectItem>
                             <SelectItem value="11-50">11-50 employees</SelectItem>
                             <SelectItem value="51-200">51-200 employees</SelectItem>
                             <SelectItem value="201-1000">201-1000 employees</SelectItem>
                             <SelectItem value="1001+">1001+ employees</SelectItem>
                         </SelectContent>
                     </Select>
                   </div>
               </div>

                <div className="space-y-2">
                    <Label>Address</Label>
                     <div className="space-y-2">
                        <Input placeholder="Street Address" value={formData.address.street} onChange={e => handleInputChange('address.street', e.target.value)} disabled={isLoading} className="bg-background/50 backdrop-blur-sm"/>
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="City" value={formData.address.city} onChange={e => handleInputChange('address.city', e.target.value)} disabled={isLoading} className="bg-background/50 backdrop-blur-sm"/>
                            <Input placeholder="State / Province" value={formData.address.state} onChange={e => handleInputChange('address.state', e.target.value)} disabled={isLoading} className="bg-background/50 backdrop-blur-sm"/>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="ZIP / Postal Code" value={formData.address.zip} onChange={e => handleInputChange('address.zip', e.target.value)} disabled={isLoading} className="bg-background/50 backdrop-blur-sm"/>
                            <Input placeholder="Country" value={formData.address.country} onChange={e => handleInputChange('address.country', e.target.value)} disabled={isLoading} className="bg-background/50 backdrop-blur-sm"/>
                        </div>
                    </div>
                </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Start 30-Day Free Trial <ArrowRight className="h-4 w-4 ml-2"/></>
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
