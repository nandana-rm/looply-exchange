import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Heart, MessageCircle, Flag, Star, MapPin, 
  Calendar, Eye, Gift, DollarSign, Repeat2, ShoppingCart,
  Bookmark, Share2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, addLikedItem, removeLikedItem, likedItems, addSavedItem, removeSavedItem, savedItems } = useAuthStore();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsApi.getItem(id!),
    enabled: !!id,
  });

  const isLiked = item ? likedItems.includes(item.id) : false;
  const isSaved = item ? savedItems.includes(item.id) : false;
  const isOwner = user && item && user.id === item.ownerId;

  const handleLike = () => {
    if (!item || !isAuthenticated) return;
    
    if (isLiked) {
      removeLikedItem(item.id);
      toast({ title: '💔 Removed from liked items' });
    } else {
      addLikedItem(item.id);
      toast({ title: '❤️ Added to liked items' });
    }
  };

  const handleSave = () => {
    if (!item || !isAuthenticated) return;
    
    if (isSaved) {
      removeSavedItem(item.id);
      toast({ title: '📝 Removed from saved items' });
    } else {
      addSavedItem(item.id);
      toast({ title: '🔖 Saved for later' });
    }
  };

  const handleClaim = () => {
    if (!item) return;
    toast({
      title: '🎯 Claim Submitted',
      description: 'Your claim request has been sent to the item owner.',
    });
  };

  const handleProposeSwap = () => {
    if (!item) return;
    toast({
      title: '🔄 Swap Proposal',
      description: 'Choose one of your items to propose a swap.',
    });
  };

  const handleMessage = () => {
    if (!item) return;
    navigate('/messages');
    toast({
      title: '💬 Starting conversation',
      description: `Opening chat with ${item.owner?.name || 'owner'}`,
    });
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'gift': return <Gift className="h-4 w-4" />;
      case 'sell': return <DollarSign className="h-4 w-4" />;
      case 'barter': return <Repeat2 className="h-4 w-4" />;
      case 'buy': return <ShoppingCart className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'gift': return 'bg-primary text-primary-foreground';
      case 'sell': return 'bg-accent text-accent-foreground';
      case 'barter': return 'bg-secondary text-secondary-foreground';
      case 'buy': return 'bg-muted text-muted-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Item not found</h2>
          <p className="text-muted-foreground mb-4">The item you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={isSaved ? 'text-primary' : 'text-muted-foreground'}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
              
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-muted rounded-lg overflow-hidden"
            >
              <img
                src={item.images[currentImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {item.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Title and Mode */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge className={`${getModeColor(item.mode)} flex items-center space-x-1`}>
                  {getModeIcon(item.mode)}
                  <span className="capitalize">{item.mode}</span>
                </Badge>
                {item.isPromoted && (
                  <Badge variant="outline" className="text-accent border-accent">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Promoted
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">{item.title}</h1>
              
              {item.mode === 'sell' && item.price && (
                <div className="text-2xl font-bold text-accent">${item.price}</div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>

            {/* Condition & Tags */}
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-foreground">Condition: </span>
                <Badge variant="outline" className="capitalize">{item.condition}</Badge>
              </div>
              
              {item.tags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-foreground mb-2 block">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Barter Details */}
            {item.mode === 'barter' && (item.desiredTags || item.desiredText) && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-foreground mb-2">Looking for:</h3>
                  {item.desiredText && (
                    <p className="text-muted-foreground mb-2">{item.desiredText}</p>
                  )}
                  {item.desiredTags && item.desiredTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.desiredTags.map((tag) => (
                        <Badge key={tag} variant="outline">#{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Owner Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.owner?.avatar} />
                    <AvatarFallback>{item.owner?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{item.owner?.name || 'Unknown User'}</h3>
                      {item.owner?.role === 'ngo' && (
                        <Badge className="bg-primary text-primary-foreground">NGO</Badge>
                      )}
                      {item.owner?.isVerified && (
                        <Badge variant="outline" className="text-primary border-primary">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    {item.owner?.karma && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-current text-primary" />
                        <span>{item.owner.karma} karma</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>{item.views} views</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {!isOwner && isAuthenticated && (
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <Button
                    onClick={handleLike}
                    variant={isLiked ? "default" : "outline"}
                    className="flex-1"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Liked' : 'Like'}
                  </Button>
                  
                  <Button onClick={handleMessage} className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
                
                {item.mode === 'gift' && user?.role === 'ngo' && (
                  <Button onClick={handleClaim} className="w-full bg-accent hover:bg-accent/90">
                    <Gift className="h-4 w-4 mr-2" />
                    Claim for NGO
                  </Button>
                )}
                
                {item.mode === 'barter' && (
                  <Button onClick={handleProposeSwap} variant="outline" className="w-full">
                    <Repeat2 className="h-4 w-4 mr-2" />
                    Propose Swap
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                  <Flag className="h-4 w-4 mr-2" />
                  Report Item
                </Button>
              </div>
            )}
            
            {!isAuthenticated && (
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-muted-foreground mb-4">
                    Sign in to interact with this item
                  </p>
                  <div className="flex space-x-2">
                    <Button asChild className="flex-1">
                      <a href="/login">Login</a>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <a href="/register">Sign Up</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;