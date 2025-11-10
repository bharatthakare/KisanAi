'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IndianStates } from '@/lib/locations';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  village: z.string().min(1, 'Village is required'),
});

const loginSchema = z.object({
  name: z.string().optional(),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit number'),
});

export default function ProfilePage() {
  const { t } = useLanguage();
  // This is a placeholder. In a real app, you'd check auth state.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const [selectedState, setSelectedState] = useState('');
  const districts = selectedState ? IndianStates.find(s => s.name === selectedState)?.districts : [];


  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: "Ramesh Kumar",
        state: "Maharashtra",
        district: "Nagpur",
        village: "Koradi",
    }
  });
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
          name: "",
          mobile: "",
      }
  })

  function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    console.log(values);
    // TODO: Save profile data
  }
  
  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    console.log(values);
    if (!isLoggedIn) {
        setOtpSent(true);
    }
  }
  
  function handleLogout() {
      setIsLoggedIn(false);
      setOtpSent(false);
  }
  
  // A mock login function for demonstration
  function handleVerifyOtp() {
      setIsLoggedIn(true);
  }


  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      {isLoggedIn ? (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{t('my_profile')}</CardTitle>
            <CardDescription>{t('view_manage_account')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('full_name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('enter_full_name')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={profileForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                       <Select onValueChange={(value) => { field.onChange(value); setSelectedState(value); }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {IndianStates.map(state => (
                            <SelectItem key={state.name} value={state.name}>{state.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={profileForm.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedState}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {districts?.map(district => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village / Town</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your village or town name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Save Changes</Button>
              </form>
            </Form>
            <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>{t('log_out')}</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{t('login_or_signup')}</CardTitle>
            <CardDescription>{t('enter_mobile_for_otp')}</CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...loginForm}>
                 <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                 {!otpSent && (
                    <FormField
                        control={loginForm.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('full_name')}</FormLabel>
                            <FormControl>
                            <Input placeholder={t('enter_full_name')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                 )}
                 <FormField
                    control={loginForm.control}
                    name="mobile"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('mobile_number')}</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder={t('enter_mobile_number')} {...field} disabled={otpSent} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                {otpSent ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input id="otp" placeholder="Enter the 6-digit code" />
                        </div>
                        <Button onClick={handleVerifyOtp} className="w-full">Verify OTP</Button>
                        <Button variant="link" size="sm" onClick={() => setOtpSent(false)} className='w-full'>Back</Button>
                    </div>
                ) : (
                    <Button type="submit" className="w-full">{t('send_otp')}</Button>
                )}
                 </form>
             </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
