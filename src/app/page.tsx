import { WeatherCard } from '@/components/weather-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lightbulb, MessageCircle, ShoppingCart, Users } from 'lucide-react';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';

const quickLinks = [
  {
    href: '/assistant',
    title: 'AI Assistant',
    description: 'Get farming advice',
    icon: MessageCircle,
  },
  {
    href: '/market',
    title: 'Market Prices',
    description: 'Check crop prices',
    icon: ShoppingCart,
  },
  {
    href: '/community',
    title: 'Community',
    description: 'Connect with farmers',
    icon: Users,
  },
   {
    href: '/settings',
    title: 'Settings',
    description: 'Customize your app',
    icon: Lightbulb,
  },
];

export default function Home() {
  const heroImage = placeholderImages.find(p => p.id === 'hero');
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <Card className="overflow-hidden shadow-lg">
          <div className="relative h-64 w-full">
            {heroImage &&
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
              />
            }
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
              <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">Welcome to KisanAI</h1>
              <p className="text-lg md:text-xl max-w-2xl">Your smart farming partner for a richer harvest.</p>
            </div>
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-headline font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link href={link.href} key={link.href} passHref>
                  <Card className="hover:shadow-md hover:border-primary/50 transition-all duration-300 h-full">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                       <div className="bg-primary/20 p-2 rounded-lg">
                        <link.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="font-headline text-xl">{link.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{link.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
        
        <aside className="space-y-8">
          <WeatherCard />
        </aside>

      </div>
    </div>
  );
}
