import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, MapPin, Mail, Calendar, Settings, LogOut, 
  Edit, Camera, Badge as BadgeIcon, Star, Heart,
  Package, MessageCircle, TrendingUp
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
  };

  const stats = [
    { label: 'Items Listed', value: '12', icon: Package, color: 'text-primary' },
    { label: 'Messages', value: '48', icon: MessageCircle, color: 'text-accent' },
    { label: 'Likes Received', value: '156', icon: Heart, color: 'text-destructive' },
    { label: 'Profile Views', value: '89', icon: TrendingUp, color: 'text-primary-glow' }
  ];

  const achievements = [
    { title: 'First Listing', description: 'Listed your first item', completed: true },
    { title: 'Community Helper', description: 'Helped 5 community members', completed: true },
    { title: 'Eco Warrior', description: 'Gifted 10 items', completed: false },
    { title: 'Social Butterfly', description: 'Had 50 conversations', completed: false },
  ];

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <User className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login to View Profile
          </h2>
          <p className="text-muted-foreground mb-6">
            Access your profile, settings, and activity.
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
      {/* Header Section */}
      <div className="bg-gradient-subtle border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between"
          >
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              {/* Profile Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-card">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                  {user.role === 'ngo' && (
                    <Badge className="bg-primary text-primary-foreground">
                      <BadgeIcon className="h-3 w-3 mr-1" />
                      NGO
                    </Badge>
                  )}
                  {user.isVerified && (
                    <Badge className="bg-accent text-accent-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="ghost">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center hover:shadow-card transition-shadow">
                <CardContent className="p-6">
                  <stat.icon className={cn("h-8 w-8 mx-auto mb-3", stat.color)} />
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Profile Completion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profile Complete</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Profile photo uploaded</span>
                    </div>
                    <div className="flex items-center space-x-2 text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Location added</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <span>Add bio description</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <span>Verify phone number</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Listed a new item', item: 'Vintage Camera', time: '2 hours ago' },
                      { action: 'Received a message about', item: 'Leather Jacket', time: '1 day ago' },
                      { action: 'Completed exchange for', item: 'Art Supplies', time: '3 days ago' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <span className="text-foreground">{activity.action} </span>
                          <span className="text-primary font-medium">{activity.item}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>My Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No listings yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start by adding your first item to the marketplace.
                  </p>
                  <Button asChild>
                    <a href="/add-item">Add Your First Item</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No activity yet
                    </h3>
                    <p className="text-muted-foreground">
                      Your activity will appear here as you use Looply.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.title}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-colors",
                        achievement.completed 
                          ? "border-primary bg-primary/5" 
                          : "border-muted bg-muted/30"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          achievement.completed 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        )}>
                          <Star className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className={cn(
                            "font-semibold",
                            achievement.completed ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;