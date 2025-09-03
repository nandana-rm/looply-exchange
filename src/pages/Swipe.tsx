import { useState, useEffect } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { Heart, X, RotateCcw, Filter, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '@/lib/api';
import { useFiltersStore, useAuthStore } from '@/lib/store';
import { Item } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ItemCard from '@/components/ItemCard';
import SearchFilters from '@/components/SearchFilters';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

const Swipe = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const { filters } = useFiltersStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ['swipe-items', filters],
    queryFn: () => itemsApi.getItems(filters),
    staleTime: 5 * 60 * 1000,
  });

  const currentItem = allItems[currentIndex];
  const hasMoreItems = currentIndex < allItems.length - 1;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      } else if (e.key === 'Escape' && currentItem) {
        // Could open item details modal
        console.log('Open item details:', currentItem.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentItem]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentItem) return;

    setSwipeDirection(direction);

    if (direction === 'right') {
      setLikedItems(prev => [...prev, currentItem.id]);
      toast({
        title: '❤️ Liked!',
        description: `You liked "${currentItem.title}"`,
      });
    } else {
      toast({
        title: '👋 Passed',
        description: `Passed on "${currentItem.title}"`,
      });
    }

    // Move to next item after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 100;
    const swipeVelocityThreshold = 500;

    if (
      info.offset.x > swipeThreshold || 
      info.velocity.x > swipeVelocityThreshold
    ) {
      handleSwipe('right');
    } else if (
      info.offset.x < -swipeThreshold || 
      info.velocity.x < -swipeVelocityThreshold
    ) {
      handleSwipe('left');
    }
  };

  const resetStack = () => {
    setCurrentIndex(0);
    setLikedItems([]);
    setSwipeDirection(null);
    toast({
      title: '🔄 Stack Reset',
      description: 'Starting fresh with all items',
    });
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center">
        <Heart className="h-12 w-12 text-primary-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No more items to swipe!
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        You've seen all available items. Try adjusting your filters or check back later for new listings.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={resetStack} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Start Over
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Filter className="h-4 w-4 mr-2" />
              Adjust Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <SearchFilters />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  const LoadingState = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading items to swipe...</p>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login to Start Swiping
          </h2>
          <p className="text-muted-foreground mb-6">
            Join Looply to discover and connect with amazing items in your community.
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
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Swipe & Discover</h1>
              <p className="text-muted-foreground">
                Find your next favorite item with a swipe
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-96">
                  <SheetHeader>
                    <SheetTitle>Swipe Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <SearchFilters />
                  </div>
                </SheetContent>
              </Sheet>

              {likedItems.length > 0 && (
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2 fill-current text-primary" />
                  {likedItems.length}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <LoadingState />
        ) : !currentItem ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col items-center">
            {/* Progress Indicator */}
            <div className="w-full max-w-md mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>{currentIndex + 1} of {allItems.length}</span>
                <span>{Math.round(((currentIndex + 1) / allItems.length) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / allItems.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Swipe Card Stack */}
            <div className="relative w-full max-w-sm mx-auto h-[600px] mb-8">
              <AnimatePresence mode="wait">
                {currentItem && (
                  <motion.div
                    key={currentItem.id}
                    className="absolute inset-0"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
                      rotate: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0
                    }}
                    exit={{ 
                      scale: 0.95, 
                      opacity: 0,
                      x: swipeDirection === 'left' ? -300 : 300,
                      rotate: swipeDirection === 'left' ? -15 : 15
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ cursor: 'grabbing' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <ItemCard
                      item={currentItem}
                      variant="swipe"
                      onClick={() => console.log('Open details:', currentItem.id)}
                      onLike={() => handleSwipe('right')}
                      onMessage={() => console.log('Message:', currentItem.id)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next card preview */}
              {allItems[currentIndex + 1] && (
                <div className="absolute inset-0 -z-10 scale-95 opacity-50">
                  <ItemCard
                    item={allItems[currentIndex + 1]}
                    variant="swipe"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-8">
              <Button
                variant="outline"
                size="lg"
                className="w-16 h-16 rounded-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleSwipe('left')}
                disabled={!currentItem}
              >
                <X className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={resetStack}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <Button
                size="lg"
                className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90"
                onClick={() => handleSwipe('right')}
                disabled={!currentItem}
              >
                <Heart className="h-6 w-6" />
              </Button>
            </div>

            {/* Keyboard Hints */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Keyboard shortcuts:
              </p>
              <div className="flex justify-center space-x-6 text-xs">
                <div className="flex items-center space-x-1">
                  <ArrowLeft className="h-3 w-3" />
                  <span>Pass</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowRight className="h-3 w-3" />
                  <span>Like</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs bg-muted px-2 py-1 rounded">ESC</span>
                  <span>Details</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Swipe;