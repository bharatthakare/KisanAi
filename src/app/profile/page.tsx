
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
import { useEffect, useState, useMemo } from 'react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signInAnonymously, updateProfile } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  village: z.string().min(1, 'Village is required'),
});

const loginSchema = z.object({
  mobile: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit number'),
});

export default function ProfilePage() {
  const { t } = useLanguage();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const [selectedState, setSelectedState] = useState(userProfile?.state || '');
  const districts = selectedState ? IndianStates.find(s => s.name === selectedState)?.districts : [];

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      state: '',
      district: '',
      village: '',
    },
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobile: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        name: userProfile.name || '',
        state: userProfile.state || '',
        district: userProfile.district || '',
        village: userProfile.village || '',
      });
      if(userProfile.state) setSelectedState(userProfile.state);
    }
  }, [userProfile, profileForm]);

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!user || !userDocRef) return;

    try {
      const profileData: Partial<UserProfile> = {
        ...values,
        id: user.uid,
        name: values.name
      };

      // Update Firestore document
      setDocumentNonBlocking(userDocRef, profileData, { merge: true });

      // Update auth profile if name changed
      if (user.displayName !== values.name) {
        await updateProfile(user, { displayName: values.name });
      }

      toast({
        title: t('profile_updated_title'),
        description: t('profile_updated_description'),
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error.message || t('could_not_save_profile'),
        variant: 'destructive',
      });
    }
  }

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    // For now, we will use anonymous sign in for simplicity
    signInAnonymously(auth).catch(error => {
       console.error("Anonymous sign in error", error);
       toast({
           title: t('login_failed'),
           description: t('login_failed_description'),
           variant: "destructive"
       })
    });
  }

  function handleLogout() {
    auth.signOut();
  }

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      {user ? (
        <Card className="shadow-lg animate-in fade-in-50 zoom-in-95 duration-500">
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
                      <FormLabel>{t('state')}</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedState(value);
                          profileForm.setValue('district', '');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select_state')} />
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
                      <FormLabel>{t('district')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select_district')} />
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
                      <FormLabel>{t('village_town')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('enter_village_town')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('save_changes')}
                </Button>
              </form>
            </Form>
            <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>{t('log_out')}</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg animate-in fade-in-50 zoom-in-95 duration-500">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{t('login_or_signup')}</CardTitle>
            <CardDescription>{t('enter_mobile_for_otp')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mobile_number')}</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder={t('enter_mobile_number')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                    {loginForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('login_or_signup')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
