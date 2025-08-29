import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Grid3X3, List, Filter, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { itemsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ItemCard from '@/components/ItemCard';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import SearchFilters from '@/components/SearchFilters';
import { useToast } from '@/hooks/use-toast';

const MyListings = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: allItems = [], isLoading, refetch } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => itemsApi.getItems(),
    enabled: isAuthenticated,
  });

  const myItems = allItems.filter(item => item.ownerId === user?.id);
  
  const filteredItems = myItems.filter(item =>
    searchQuery === '' || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (itemId: string) => {
    toast({
      title: '✏️ Edit Item',
      description: 'Redirecting to edit form...',
    });
    // Navigate to edit form
  };

  const handleDelete = async (itemId: string) => {
    try {
      await itemsApi.deleteItem(itemId);
      toast({
        title: '🗑️ Item Deleted',
        description: 'Your item has been removed from the marketplace.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login to View Your Listings
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to manage your marketplace listings and add new items.
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

  if (user?.role === 'ngo') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            NGOs Cannot Create Listings
          </h2>
          <p className="text-muted-foreground mb-6">
            As an NGO, you can claim donated items but cannot create marketplace listings.
          </p>
          <Button asChild>
            <a href="/ngo-dashboard">Go to NGO Dashboard</a>
          </Button>
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
                <Package className="h-8 w-8 mr-3 text-primary" />
                My Listings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your marketplace items
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button asChild>
                <a href="/add-item">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </a>
              </Button>
              
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
          </div>

          {/* Search and Filters */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your listings..."
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
                  <SheetTitle>Filter My Listings</SheetTitle>
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
            <p className="text-muted-foreground">Loading your listings...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {myItems.length === 0 ? 'No listings yet' : 'No items match your search'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {myItems.length === 0 
                ? 'Start sharing items with your community by creating your first listing!'
                : 'Try adjusting your search query to find specific listings.'
              }
            </p>
            {myItems.length === 0 && (
              <Button asChild>
                <a href="/add-item">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </a>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-foreground">{myItems.length}</div>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-foreground">
                    {myItems.filter(item => item.status === 'active').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-foreground">
                    {myItems.reduce((sum, item) => sum + item.views, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-primary">
                    {myItems.filter(item => item.mode === 'gift').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Gifts</p>
                </CardContent>
              </Card>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {filteredItems.length} of {myItems.length} listings
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
                  className="relative group"
                >
                  <ItemCard
                    item={item}
                    variant={viewMode === 'grid' ? 'grid' : 'list'}
                    showOwnerActions
                  />
                  
                  {/* Owner Actions Overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant={item.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  {/* Views Counter */}
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      {item.views}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyListings;