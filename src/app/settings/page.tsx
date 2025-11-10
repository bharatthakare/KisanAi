'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Bell, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function SettingsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleEnableNotifications = () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Error',
        description: 'This browser does not support desktop notifications.',
        variant: 'destructive',
      });
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        toast({
          title: 'Success!',
          description: 'Notifications have been enabled.',
        });
        // Example notification
        new Notification('KisanAI Notifications', {
          body: 'You will now receive updates!',
        });
      } else {
        toast({
          title: 'Notifications Denied',
          description: 'You can enable notifications from your browser settings.',
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-6">{t('settings')}</h1>
      <Card>
        <CardHeader className='flex-row items-center gap-4 space-y-0'>
            <Languages className='w-6 h-6' />
            <div>
                <CardTitle>{t('language')}</CardTitle>
                <CardDescription>Choose your preferred language for the app.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
        
        <Separator className='my-4'/>
        
        <CardHeader className='flex-row items-center gap-4 space-y-0'>
            <Bell className='w-6 h-6' />
            <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Enable notifications for important alerts.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handleEnableNotifications}>Enable Notifications</Button>
        </CardContent>
      </Card>
    </div>
  );
}
