import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, MessageCircle, MapPin, Eye, Clock, Gift,
  ArrowUpDown, DollarSign, ShoppingBag, MoreVertical,
  Share2, Flag, Bookmark
} from 'lucide-react';
import { Item } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: Item;
  onLike?: (item: Item) => void;
  onMessage?: (item: Item) => void;
  onClick?: (item: Item) => void;
  variant?: 'grid' | 'list' | 'swipe';
  className?: string;
}

const ItemCard = ({ 
  item, 
  onLike, 
  onMessage, 
  onClick, 
  variant = 'grid',
  className 
}: ItemCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const modeConfig = {
    gift: { icon: Gift, label: 'Free Gift', color: 'bg-primary text-primary-foreground' },
    barter: { icon: ArrowUpDown, label: 'Barter', color: 'bg-accent text-accent-foreground' },
    sell: { icon: DollarSign, label: 'For Sale', color: 'bg-destructive text-destructive-foreground' },
    buy: { icon: ShoppingBag, label: 'Wanted', color: 'bg-secondary text-secondary-foreground' }
  };

  const config = modeConfig[item.mode];
  const ModeIcon = config.icon;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(item);
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMessage?.(item);
  };

  const handleClick = () => {
    onClick?.(item);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (variant === 'swipe') {
    return (
      <motion.div
        className={cn(
          "relative w-full max-w-sm mx-auto bg-card rounded-2xl shadow-elevated overflow-hidden",
          "cursor-pointer select-none",
          className
        )}
        whileHover={{ scale: 1.02 }}
        onClick={handleClick}
      >
        {/* Image */}
        <div className="relative aspect-square">
          <img
            src={item.images[imageIndex]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation Dots */}
          {item.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {item.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageIndex(index);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === imageIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {/* Mode Badge */}
          <div className="absolute top-4 left-4">
            <Badge className={cn(config.color, "flex items-center space-x-1")}>
              <ModeIcon className="h-3 w-3" />
              <span className="text-xs font-semibold">{config.label}</span>
            </Badge>
          </div>

          {/* NGO Badge */}
          {item.owner.role === 'ngo' && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-primary text-primary-foreground">NGO</Badge>
            </div>
          )}

          {/* Price */}
          {item.mode === 'sell' && item.price && (
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-white font-bold">${item.price}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {item.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {item.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Owner & Location */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <img
                src={item.owner.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                alt={item.owner.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-muted-foreground">{item.owner.name}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{item.location.address}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handleLike}
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 transition-colors",
                isLiked && "bg-primary text-primary-foreground border-primary"
              )}
            >
              <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
              Like
            </Button>
            <Button
              onClick={handleMessage}
              size="sm"
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-elevated",
        "group relative",
        variant === 'list' && "flex",
        className
      )}
      onClick={handleClick}
    >
      <div className={cn(
        "relative",
        variant === 'list' ? "w-48 flex-shrink-0" : "aspect-square"
      )}>
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

        {/* Mode Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn(config.color, "flex items-center space-x-1")}>
            <ModeIcon className="h-3 w-3" />
            <span className="text-xs font-semibold">{config.label}</span>
          </Badge>
        </div>

        {/* Actions overlay */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price */}
        {item.mode === 'sell' && item.price && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1">
            <span className="text-white text-sm font-bold">${item.price}</span>
          </div>
        )}

        {/* NGO Badge */}
        {item.owner.role === 'ngo' && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-primary text-primary-foreground text-xs">NGO</Badge>
          </div>
        )}
      </div>

      <CardContent className={cn("p-4", variant === 'list' && "flex-1")}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
            {item.title}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{item.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{item.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(item.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{item.location.address}</span>
          </div>
        </div>

        {/* Owner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={item.owner.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop&crop=face'}
              alt={item.owner.name}
              className="w-5 h-5 rounded-full"
            />
            <span className="text-sm text-muted-foreground">{item.owner.name}</span>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "h-8 w-8 p-0",
                isLiked && "text-primary"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMessage}
              className="h-8 w-8 p-0"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemCard;