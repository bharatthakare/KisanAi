'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { marketPrices as allMarketPrices } from '@/lib/placeholder-data';
import { TrendUpIcon, TrendDownIcon, TrendStableIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { MarketPrice } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useWeather } from '@/hooks/use-weather';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

const TrendIndicator = ({ trend }: { trend: MarketPrice['trend'] }) => {
  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-500',
  };

  const trendIcons = {
    up: <TrendUpIcon className="h-4 w-4" />,
    down: <TrendDownIcon className="h-4 w-4" />,
    stable: <TrendStableIcon className="h-4 w-4" />,
  };
  
  return (
    <span className={cn('flex items-center gap-1 font-medium', trendClasses[trend])}>
      {trendIcons[trend]}
      <span className="capitalize">{trend}</span>
    </span>
  );
};

// Haversine formula to calculate distance between two lat/lon points
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export default function MarketPage() {
  const { weather, loading: weatherLoading, error: weatherError } = useWeather();
  const [nearbyMarkets, setNearbyMarkets] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (!weatherLoading) {
      let sortedMarkets;
      if (weather && !weatherError) {
        sortedMarkets = allMarketPrices
          .map(market => ({
            ...market,
            distance: getDistance(weather.lat, weather.lon, market.lat, market.lon),
          }))
          .sort((a, b) => a.distance - b.distance);
      } else {
        // Fallback to alphabetical sort if location is unavailable
        sortedMarkets = [...allMarketPrices].sort((a, b) => a.market.localeCompare(b.market));
      }
      setNearbyMarkets(sortedMarkets);
      setLoading(false);
    }
  }, [weather, weatherLoading, weatherError]);


  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t('market_prices')}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            {weather && !weatherError ? <><MapPin className="w-4 h-4"/> {t('showing_markets_near')} {weather.location}</> : t('latest_prices')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('crop')}</TableHead>
                  <TableHead>{t('market')}</TableHead>
                  <TableHead className="text-right">{t('price_per_unit')}</TableHead>
                  <TableHead>{t('trend')}</TableHead>
                  <TableHead className="text-right">{t('last_updated')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  nearbyMarkets.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.crop}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.market}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{item.price.toLocaleString('en-IN')}/{item.unit}
                      </TableCell>
                      <TableCell>
                        <TrendIndicator trend={item.trend} />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
