
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

export default function ProfilePage() {
  const { t } = useLanguage();
  // This is a placeholder. In a real app, you'd check auth state.
  const isLoggedIn = false;

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      {isLoggedIn ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('my_profile')}</CardTitle>
            <CardDescription>{t('view_manage_account')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('name')}</Label>
              <p className="font-semibold">Ramesh Kumar</p>
            </div>
            <div>
              <Label>{t('mobile_number')}</Label>
              <p className="font-semibold">+91-98XXXXXX99</p>
            </div>
            <Button variant="destructive" className="w-full">{t('log_out')}</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{t('login_or_signup')}</CardTitle>
            <CardDescription>{t('enter_mobile_for_otp')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('full_name')}</Label>
              <Input id="name" placeholder={t('enter_full_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">{t('mobile_number')}</Label>
              <Input id="mobile" type="tel" placeholder={t('enter_mobile_number')} />
            </div>
            <Button className="w-full">{t('send_otp')}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
