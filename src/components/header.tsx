
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, UserCircle, Settings } from 'lucide-react';
import { Logo } from './icons';
import { useLanguage } from '@/contexts/language-context';

export function Header() {
  const { t } = useLanguage();
  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/plant-doctor', label: 'Plant Doctor' },
    { href: '/assistant', label: t('ai_assistant') },
    { href: '/market', label: t('market') },
    { href: '/community', label: t('community') },
  ];
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline">KisanAI</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Logo className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline">KisanAI</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                    {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-foreground"
                    >
                        {link.label}
                    </Link>
                    ))}
                </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search can go here */}
          </div>
          <nav className="flex items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">{t('profile')}</span>
              </Link>
            </Button>
             <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">{t('settings')}</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
