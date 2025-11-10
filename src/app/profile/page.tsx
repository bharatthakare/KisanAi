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

export default function ProfilePage() {
  // This is a placeholder. In a real app, you'd check auth state.
  const isLoggedIn = false;

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      {isLoggedIn ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">My Profile</CardTitle>
            <CardDescription>View and manage your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <p className="font-semibold">Ramesh Kumar</p>
            </div>
            <div>
              <Label>Mobile Number</Label>
              <p className="font-semibold">+91-98XXXXXX99</p>
            </div>
            <Button variant="destructive" className="w-full">Log Out</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Login or Sign Up</CardTitle>
            <CardDescription>Enter your mobile number to receive an OTP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" type="tel" placeholder="Enter your 10-digit mobile number" />
            </div>
            <Button className="w-full">Send OTP</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
