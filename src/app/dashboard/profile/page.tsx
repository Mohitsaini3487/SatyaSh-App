'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Camera, Loader2, Palette } from 'lucide-react';
import { useUser } from '@/firebase';
import { useMemo } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();

  const userInitial = useMemo(() => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }, [user]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
       <div className="p-4 md:p-8 space-y-8">
         <header>
          <h1 className="text-3xl font-headline font-bold">User Profile</h1>
          <p className="text-muted-foreground">
            Please log in to view your profile.
          </p>
        </header>
       </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold">User Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information, preferences, and security settings.
        </p>
      </header>
      
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <div className="my-6 border-t"></div>

            <TabsContent value="personal">
              <div className="space-y-6">
                <h3 className="text-lg font-medium font-headline">Personal Details</h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                          <AvatarImage src={user.photoURL ?? undefined} data-ai-hint="person face" />
                          <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                        <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background">
                            <Camera className="h-4 w-4"/>
                            <span className="sr-only">Change photo</span>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue={user.displayName?.split(' ')[0] ?? ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue={user.displayName?.split(' ').slice(1).join(' ') ?? ''} />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={user.email ?? ''} disabled/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input id="mobile" defaultValue={user.phoneNumber ?? ''} />
                    </div>
                </div>
                <Button className="bg-accent hover:bg-accent/90">Save Changes</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="social">
              <div className="space-y-6 max-w-md">
                <h3 className="text-lg font-medium font-headline">Social Profiles</h3>
                <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input id="twitter" placeholder="https://x.com/username" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input id="linkedin" placeholder="https://linkedin.com/in/username" />
                </div>
                <Button className="bg-accent hover:bg-accent/90">Save Social Links</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences">
              <div className="space-y-6 max-w-md">
                <h3 className="text-lg font-medium font-headline">Notification Preferences</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <Label htmlFor="newsletter" className="font-medium">Subscribe to Newsletter</Label>
                        <p className="text-sm text-muted-foreground">Receive weekly updates on misinformation trends.</p>
                    </div>
                    <Switch id="newsletter" defaultChecked />
                </div>
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <Label htmlFor="security-alerts" className="font-medium">Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about suspicious activities in your account.</p>
                    </div>
                    <Switch id="security-alerts" defaultChecked/>
                </div>
                <Button className="bg-accent hover:bg-accent/90">Save Preferences</Button>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6 max-w-md">
                <h3 className="text-lg font-medium font-headline">Appearance</h3>
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <Label htmlFor="theme" className="font-medium">Theme</Label>
                        <p className="text-sm text-muted-foreground">Select your preferred interface theme.</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-[120px]">
                           <Palette className="mr-2 h-4 w-4" /> Theme
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent>
                          <ThemeToggle />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            </TabsContent>
            
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
