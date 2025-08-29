import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, User, Bell, Shield, HelpCircle, 
  FileText, Flag, Moon, Sun, Globe, Star, Edit, Camera,
  Smartphone, Monitor, Tablet
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleProfileUpdate = (field: string, value: string) => {
    if (!user) return;
    
    updateUser({ [field]: value });
    toast({
      title: '✅ Profile Updated',
      description: `Your ${field} has been updated successfully.`,
    });
  };

  const handleOpenGuide = () => {
    toast({
      title: '📖 Opening Guide',
      description: 'Loading the complete Looply user guide...',
    });
    // This would open the guide component/modal
  };

  const handleReportProblem = () => {
    toast({
      title: '🚨 Reporting Problem',
      description: 'Opening problem report form...',
    });
  };

  const handleExportData = () => {
    toast({
      title: '📁 Exporting Data',
      description: 'Your data export will be ready shortly...',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <SettingsIcon className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login to Access Settings
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to customize your Looply experience and manage your account.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/register">Sign Up</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <SettingsIcon className="h-8 w-8 mr-3 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and preferences
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-foreground">{user.name}</div>
                <div className="flex items-center space-x-2">
                  <Badge className={user.role === 'ngo' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}>
                    {user.role === 'ngo' ? 'NGO' : 'User'}
                  </Badge>
                  {user.karma && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-current text-primary" />
                      <span>{user.karma}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Upload a photo to personalize your profile
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      defaultValue={user.name}
                      onBlur={(e) => handleProfileUpdate('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user.email}
                      onBlur={(e) => handleProfileUpdate('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell others about yourself..."
                    defaultValue={user.bio || ''}
                    onBlur={(e) => handleProfileUpdate('bio', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    defaultValue={user.location.address}
                    onBlur={(e) => handleProfileUpdate('location', e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Account Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        Verified accounts build more trust in the community
                      </p>
                    </div>
                    <Badge variant={user.isVerified ? 'default' : 'outline'}>
                      {user.isVerified ? '✓ Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                  {!user.isVerified && (
                    <Button variant="outline" size="sm" className="mt-2">
                      Start Verification
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications about messages and activity
                    </div>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Get email updates about your account
                    </div>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Community Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about new features and community events
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Dark Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                    />
                    <Moon className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default View Mode</Label>
                  <Select defaultValue="grid">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Items Per Page</Label>
                  <Select defaultValue="20">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 items</SelectItem>
                      <SelectItem value="20">20 items</SelectItem>
                      <SelectItem value="50">50 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Profile Visibility</div>
                    <div className="text-sm text-muted-foreground">
                      Control who can see your profile information
                    </div>
                  </div>
                  <Select defaultValue="public">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Show Online Status</div>
                    <div className="text-sm text-muted-foreground">
                      Let others see when you're active
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Location Sharing</div>
                    <div className="text-sm text-muted-foreground">
                      Share your approximate location for better matches
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-4">Data Management</h4>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={handleExportData}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export My Data
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of your account data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleOpenGuide}
                    className="h-auto p-4 justify-start"
                  >
                    <div className="text-left">
                      <div className="font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        How to Use Guide
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Complete walkthrough of Looply features
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                  >
                    <div className="text-left">
                      <div className="font-medium flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        FAQ
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Frequently asked questions
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleReportProblem}
                    className="h-auto p-4 justify-start"
                  >
                    <div className="text-left">
                      <div className="font-medium flex items-center">
                        <Flag className="h-4 w-4 mr-2" />
                        Report a Problem
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Get help with issues or bugs
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                  >
                    <div className="text-left">
                      <div className="font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Terms & Privacy
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Read our terms and privacy policy
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-2">App Information</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>Version: 1.0.0</div>
                    <div>Build: 2024.02.28</div>
                    <div>Device: <Monitor className="h-3 w-3 inline mr-1" />Desktop</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;