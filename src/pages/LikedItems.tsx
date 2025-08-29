import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Grid3X3, List, Filter, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ItemCard from '@/components/ItemCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import SearchFilters from '@/components/SearchFilters';

const LikedItems = () => {
  const { user, isAuthenticated, likedItems } = useAuthStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ['liked-items'],
    queryFn: () => itemsApi.getItems(),
    enabled: isAuthenticated,
  });

  const likedItemsData = allItems.filter(item => likedItems.includes(item.id));
  
  const filteredItems = likedItemsData.filter(item =>
    searchQuery === '' || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login to View Liked Items
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to see all the items you've liked and saved for later.
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Heart className="h-8 w-8 mr-3 text-primary fill-current" />
                Liked Items
              </h1>
              <p className="text-muted-foreground mt-1">
                Items you've shown interest in
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your liked items..."
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
                  <SheetTitle>Filter Liked Items</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <SearchFilters />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your liked items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {likedItems.length === 0 ? 'No liked items yet' : 'No items match your search'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {likedItems.length === 0 
                ? 'Start exploring the marketplace and like items that catch your interest!'
                : 'Try adjusting your search query to find what you\'re looking for.'
              }
            </p>
            {likedItems.length === 0 && (
              <Button asChild>
                <a href="/marketplace">Explore Marketplace</a>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {filteredItems.length} of {likedItems.length} liked items
              </p>
            </div>

            {/* Items Grid/List */}
            <motion.div
              layout
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <ItemCard
                    item={item}
                    variant={viewMode === 'grid' ? 'grid' : 'list'}
                    showLiked
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default LikedItems;