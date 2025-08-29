import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Users, TrendingUp, Plus, Search, Heart, 
  MessageCircle, Clock, Pin, Star, Eye, Filter
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

// Mock data for forums
const mockCommunities = [
  {
    id: '1',
    name: 'Pet Lovers',
    description: 'Share pet stories, find pet supplies, and connect with fellow animal lovers',
    icon: '🐾',
    memberCount: 1234,
    postsCount: 456,
    color: 'bg-primary'
  },
  {
    id: '2',
    name: 'Plant Enthusiasts',
    description: 'Everything about plants, gardening, and green living',
    icon: '🌱',
    memberCount: 890,
    postsCount: 234,
    color: 'bg-green-500'
  },
  {
    id: '3',
    name: 'Book Exchange',
    description: 'Discuss books, share recommendations, and exchange literature',
    icon: '📚',
    memberCount: 567,
    postsCount: 789,
    color: 'bg-blue-500'
  },
  {
    id: '4',
    name: 'Tech & Gadgets',
    description: 'Technology discussions, gadget reviews, and electronics trading',
    icon: '💻',
    memberCount: 2341,
    postsCount: 1234,
    color: 'bg-purple-500'
  }
];

const mockPosts = [
  {
    id: '1',
    title: 'Amazing vintage camera collection - looking for photography books',
    content: 'I have this incredible collection of vintage cameras that I\'d love to share with the community...',
    author: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      karma: 85
    },
    communityId: '4',
    communityName: 'Tech & Gadgets',
    tags: ['vintage', 'camera', 'photography'],
    likesCount: 24,
    repliesCount: 8,
    views: 156,
    createdAt: '2024-02-28T10:30:00Z',
    isPinned: false,
    isHot: true
  },
  {
    id: '2',
    title: 'Free plants for new gardeners - Bay Area',
    content: 'I have too many plant cuttings and seedlings. Perfect for anyone starting their garden journey!',
    author: {
      name: 'Maria Garcia',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b098?w=40&h=40&fit=crop&crop=face',
      karma: 124
    },
    communityId: '2',
    communityName: 'Plant Enthusiasts',
    tags: ['free', 'plants', 'bayarea'],
    likesCount: 45,
    repliesCount: 12,
    views: 289,
    createdAt: '2024-02-27T14:20:00Z',
    isPinned: true,
    isHot: false
  }
];

const Forums = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('communities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const handleJoinCommunity = (communityName: string) => {
    toast({
      title: '🎉 Joined Community',
      description: `Welcome to ${communityName}! Start engaging with the community.`,
    });
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to create a post.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: '✏️ Create Post',
      description: 'Opening post creation form...',
    });
  };

  const handleLikePost = (postId: string, title: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to like posts.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: '❤️ Post Liked',
      description: `You liked "${title.substring(0, 30)}..."`,
    });
  };

  const handleReplyToPost = (postId: string, title: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to reply to posts.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: '💬 Replying to Post',
      description: `Opening reply form for "${title.substring(0, 30)}..."`,
    });
  };

  const filteredPosts = mockPosts.filter(post =>
    (selectedCommunity === null || post.communityId === selectedCommunity) &&
    (searchQuery === '' || 
     post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
     post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <MessageSquare className="h-8 w-8 mr-3 text-primary" />
                Community Forums
              </h1>
              <p className="text-muted-foreground mt-1">
                Connect, share, and discover with micro-communities
              </p>
            </div>
            
            <Button onClick={handleCreatePost}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search communities and posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96">
                <SheetHeader>
                  <SheetTitle>Filter Posts</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Community</h4>
                    <div className="space-y-2">
                      <Button
                        variant={selectedCommunity === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCommunity(null)}
                        className="w-full justify-start"
                      >
                        All Communities
                      </Button>
                      {mockCommunities.map((community) => (
                        <Button
                          key={community.id}
                          variant={selectedCommunity === community.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCommunity(community.id)}
                          className="w-full justify-start"
                        >
                          <span className="mr-2">{community.icon}</span>
                          {community.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="communities">
              Communities ({mockCommunities.length})
            </TabsTrigger>
            <TabsTrigger value="posts">
              Recent Posts ({filteredPosts.length})
            </TabsTrigger>
          </TabsList>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCommunities.map((community) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-elevated transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full ${community.color} flex items-center justify-center text-white text-xl`}>
                          {community.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{community.name}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{community.memberCount.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{community.postsCount}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm">{community.description}</p>
                      
                      <div className="flex space-x-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleJoinCommunity(community.name)}
                        >
                          Join Community
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedCommunity(community.id);
                            setActiveTab('posts');
                          }}
                        >
                          View Posts
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {selectedCommunity && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Showing posts from:</span>
                  <Badge variant="outline">
                    {mockCommunities.find(c => c.id === selectedCommunity)?.name}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCommunity(null)}
                >
                  Show All
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-card transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex space-x-4">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-foreground">{post.author.name}</span>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-current text-primary" />
                              <span>{post.author.karma}</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <Badge variant="outline" className="text-xs">
                              {post.communityName}
                            </Badge>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            {post.isPinned && <Pin className="h-3 w-3 text-primary" />}
                            {post.isHot && <TrendingUp className="h-3 w-3 text-accent" />}
                          </div>
                          
                          <h3 className="font-semibold text-foreground mb-2 hover:text-primary cursor-pointer">
                            {post.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {post.content}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikePost(post.id, post.title)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                {post.likesCount}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReplyToPost(post.id, post.title)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {post.repliesCount}
                              </Button>
                              
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                <span>{post.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No posts found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {selectedCommunity 
                    ? 'No posts in this community yet. Be the first to start a conversation!'
                    : 'No posts match your search. Try different keywords or browse communities.'
                  }
                </p>
                <Button onClick={handleCreatePost}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Forums;