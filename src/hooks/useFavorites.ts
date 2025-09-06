import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(f => f.listing_id);
    },
    enabled: !!user?.id,
  });

  // Add to favorites
  const addToFavoritesMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listingId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast({
        title: 'Added to favorites',
        description: 'Item has been saved to your favorites.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add item to favorites.',
        variant: 'destructive',
      });
    },
  });

  // Remove from favorites
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast({
        title: 'Removed from favorites',
        description: 'Item has been removed from your favorites.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove item from favorites.',
        variant: 'destructive',
      });
    },
  });

  return {
    favorites,
    isLoading,
    addToFavorites: addToFavoritesMutation.mutate,
    removeFromFavorites: removeFromFavoritesMutation.mutate,
    isAddingToFavorites: addToFavoritesMutation.isPending,
    isRemovingFromFavorites: removeFromFavoritesMutation.isPending,
  };
};