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
import { marketPrices } from '@/lib/placeholder-data';
import { TrendUpIcon, TrendDownIcon, TrendStableIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { MarketPrice } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

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

export default function MarketPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Market Prices</CardTitle>
          <CardDescription>
            Latest agricultural commodity prices from various markets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead className="text-right">Price (per {marketPrices[0]?.unit || 'unit'})</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketPrices.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.crop}</TableCell>
                    <TableCell className="text-right font-mono">₹{item.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.market}</Badge>
                    </TableCell>
                    <TableCell>
                      <TrendIndicator trend={item.trend} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
