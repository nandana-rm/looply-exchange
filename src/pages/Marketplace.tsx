import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, SlidersHorizontal, MapPin, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Item } from '@/types';
import { itemsApi } from '@/lib/api';
import { useFiltersStore, useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ItemCard from '@/components/ItemCard';
import SearchFilters from '@/components/SearchFilters';
import { cn } from '@/lib/utils';

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { filters } = useFiltersStore();
  const { setError } = useAppStore();

  const { 
    data: items = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['items', filters],
    queryFn: () => itemsApi.getItems(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (error) {
      setError(error instanceof Error ? error.message : 'Failed to load items');
    }
  }, [error, setError]);

  const handleItemClick = (item: Item) => {
    // TODO: Navigate to item detail page or open modal
    console.log('Item clicked:', item.id);
  };

  const handleItemLike = (item: Item) => {
    console.log('Item liked:', item.id);
    // TODO: Implement like functionality
  };

  const handleItemMessage = (item: Item) => {
    console.log('Message item owner:', item.id);
    // TODO: Navigate to chat or open message modal
  };

  const LoadingSkeleton = () => (
    <div className={cn(
      "grid gap-6",
      viewMode === 'grid' 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1"
    )}>
      {Array.from({ length: 12 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3 mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-6 flex items-center justify-center">
        <MapPin className="h-12 w-12 text-primary-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No items found
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Try adjusting your search filters or check back later for new listings in your area.
      </p>
      <Button onClick={() => window.location.reload()}>
        <Zap className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
              <p className="text-muted-foreground">
                Discover amazing items to gift, barter, sell, or buy
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center space-x-2 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <SearchFilters compact className="lg:hidden" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <SearchFilters />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {isLoading ? 'Loading...' : `${items.length} items found`}
                </h2>
                {filters.query && (
                  <span className="text-muted-foreground">
                    for "{filters.query}"
                  </span>
                )}
              </div>

              {/* Mobile View Toggle */}
              <div className="sm:hidden flex items-center space-x-2 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Items Grid/List */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingSkeleton />
                </motion.div>
              ) : items.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EmptyState />
                </motion.div>
              ) : (
                <motion.div
                  key="items"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "grid gap-6",
                    viewMode === 'grid' 
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                      : "grid-cols-1"
                  )}
                >
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ItemCard
                        item={item}
                        variant={viewMode}
                        onClick={handleItemClick}
                        onLike={handleItemLike}
                        onMessage={handleItemMessage}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load More Button */}
            {items.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Items
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;