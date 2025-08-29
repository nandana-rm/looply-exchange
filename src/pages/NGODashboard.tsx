import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Package, Users, TrendingUp, Gift, Calendar, 
  MapPin, Plus, Edit, Share2, Clock, CheckCircle,
  AlertTriangle, Zap
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Mock data for NGO Dashboard
const mockStats = {
  itemsClaimed: 156,
  activeNeeds: 8,
  peopleHelped: 342,
  impactScore: 94
};

const mockClaimableItems = [
  {
    id: '1',
    title: 'Children Books Collection',
    description: 'Educational books perfect for literacy programs',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
    location: 'Los Angeles, CA',
    date: '2024-02-28',
    donor: 'Sara Wilson'
  },
  {
    id: '2',
    title: 'Winter Clothing Bundle',
    description: 'Warm clothes for families in need',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
    location: 'New York, NY',
    date: '2024-02-27',
    donor: 'John Doe'
  }
];

const mockMyClaims = [
  {
    id: '1',
    title: 'School Supplies Set',
    claimedDate: '2024-02-25',
    status: 'claimed',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop',
    donor: 'Maria Garcia'
  }
];

const mockDonationNeeds = [
  {
    id: '1',
    title: 'Laptops for Remote Learning',
    description: 'We need 20 laptops to support students with online education',
    progress: 65,
    deadline: '2024-03-15',
    priority: 'high' as const
  },
  {
    id: '2',
    title: 'Food Supplies for Community Kitchen',
    description: 'Non-perishable food items for our weekly community meals',
    progress: 30,
    deadline: '2024-03-01',
    priority: 'medium' as const
  }
];

const NGODashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('claimable');

  const handleClaimItem = (itemId: string, title: string) => {
    toast({
      title: '🎯 Claim Submitted',
      description: `Your claim for "${title}" has been submitted and is pending approval.`,
    });
  };

  const handleContactDonor = (donorName: string) => {
    toast({
      title: '💬 Contacting Donor',
      description: `Opening chat with ${donorName}...`,
    });
  };

  const handleArrangePickup = (title: string) => {
    toast({
      title: '📦 Arranging Pickup',
      description: `Coordinating pickup for "${title}"...`,
    });
  };

  const handleMarkReceived = (title: string) => {
    toast({
      title: '✅ Marked as Received',
      description: `"${title}" has been marked as received and will help those in need.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-accent text-accent-foreground';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-primary text-primary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (!isAuthenticated || user?.role !== 'ngo') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Gift className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            NGO Access Required
          </h2>
          <p className="text-muted-foreground mb-6">
            This dashboard is only accessible to verified NGO accounts.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="/login">Login as NGO</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/marketplace">Browse Marketplace</a>
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">NGO Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage donations and help your community
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-foreground">{user.name}</div>
                <Badge className="bg-primary text-primary-foreground">NGO</Badge>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {mockStats.itemsClaimed}
                      </div>
                      <p className="text-sm text-muted-foreground">Items Claimed</p>
                    </div>
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {mockStats.activeNeeds}
                      </div>
                      <p className="text-sm text-muted-foreground">Active Needs</p>
                    </div>
                    <Package className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {mockStats.peopleHelped}
                      </div>
                      <p className="text-sm text-muted-foreground">People Helped</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {mockStats.impactScore}%
                      </div>
                      <p className="text-sm text-muted-foreground">Impact Score</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="claimable">
              Available Donations ({mockClaimableItems.length})
            </TabsTrigger>
            <TabsTrigger value="claims">
              My Claims ({mockMyClaims.length})
            </TabsTrigger>
            <TabsTrigger value="needs">
              Donation Needs ({mockDonationNeeds.length})
            </TabsTrigger>
          </TabsList>

          {/* Claimable Items Tab */}
          <TabsContent value="claimable" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Available Donations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockClaimableItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-elevated transition-shadow">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                        Donation
                      </Badge>
                    </div>
                    
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Posted {new Date(item.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Gift className="h-4 w-4" />
                          <span>Donor: {item.donor}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleClaimItem(item.id, item.title)}
                        >
                          Claim Item
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleContactDonor(item.donor)}
                        >
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* My Claims Tab */}
          <TabsContent value="claims" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                My Claimed Items
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMyClaims.map((claim) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-elevated transition-shadow">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={claim.image}
                        alt={claim.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                        Claimed
                      </Badge>
                    </div>
                    
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-foreground mb-2">{claim.title}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>Claimed {new Date(claim.claimedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Status: {claim.status}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Gift className="h-4 w-4" />
                          <span>Donor: {claim.donor}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleArrangePickup(claim.title)}
                        >
                          Arrange Pickup
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleMarkReceived(claim.title)}
                        >
                          Mark Received
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Donation Needs Tab */}
          <TabsContent value="needs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Donation Needs
              </h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post New Need
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockDonationNeeds.map((need) => (
                <motion.div
                  key={need.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-elevated transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{need.title}</CardTitle>
                        <Badge className={getPriorityColor(need.priority)}>
                          {need.priority === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {need.priority === 'medium' && <Clock className="h-3 w-3 mr-1" />}
                          {need.priority === 'low' && <Zap className="h-3 w-3 mr-1" />}
                          {need.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{need.description}</p>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">{need.progress}%</span>
                        </div>
                        <Progress value={need.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {new Date(need.deadline).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NGODashboard;