import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, X, Plus, MapPin, Tag, DollarSign, 
  Gift, ArrowUpDown, ShoppingBag, Camera, Save
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { itemsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ItemMode, ItemCondition } from '@/types';
import { categories, commonTags } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const itemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'poor'] as const),
  mode: z.enum(['gift', 'barter', 'sell', 'buy'] as const),
  price: z.number().min(0).optional(),
  desiredTags: z.array(z.string()).optional(),
  desiredText: z.string().optional(),
  tags: z.array(z.string()).min(1, 'Add at least one tag'),
  location: z.string().min(3, 'Please enter a location'),
  images: z.array(z.string()).min(1, 'Add at least one image')
});

type ItemForm = z.infer<typeof itemSchema>;

const AddItem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [desiredTagInput, setDesiredTagInput] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const form = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      condition: 'good',
      mode: 'gift',
      price: 0,
      desiredTags: [],
      desiredText: '',
      tags: [],
      location: user?.location.address || '',
      images: []
    }
  });

  const selectedMode = form.watch('mode');
  const currentTags = form.watch('tags');
  const currentDesiredTags = form.watch('desiredTags') || [];

  const modeOptions = [
    {
      value: 'gift' as ItemMode,
      title: 'Gift / Donate',
      description: 'Give away for free to help others',
      icon: Gift,
      color: 'border-primary text-primary'
    },
    {
      value: 'barter' as ItemMode,
      title: 'Barter / Trade',
      description: 'Exchange for something else',
      icon: ArrowUpDown,
      color: 'border-accent text-accent'
    },
    {
      value: 'sell' as ItemMode,
      title: 'Sell',
      description: 'Sell for money',
      icon: DollarSign,
      color: 'border-destructive text-destructive'
    },
    {
      value: 'buy' as ItemMode,
      title: 'Looking to Buy',
      description: 'Want to purchase this item',
      icon: ShoppingBag,
      color: 'border-secondary text-secondary-foreground'
    }
  ];

  const conditionOptions = [
    { value: 'new' as ItemCondition, label: 'New' },
    { value: 'excellent' as ItemCondition, label: 'Excellent' },
    { value: 'good' as ItemCondition, label: 'Good' },
    { value: 'fair' as ItemCondition, label: 'Fair' },
    { value: 'poor' as ItemCondition, label: 'Poor' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImages(prev => [...prev, imageUrl]);
        form.setValue('images', [...form.getValues('images'), imageUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    form.setValue('images', newImages);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      form.setValue('tags', [...currentTags, trimmedTag]);
      setTagInput('');
    }
  };

  const addDesiredTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !currentDesiredTags.includes(trimmedTag)) {
      form.setValue('desiredTags', [...currentDesiredTags, trimmedTag]);
      setDesiredTagInput('');
    }
  };

  const onSubmit = async (data: ItemForm) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to list an item.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await itemsApi.createItem({
        title: data.title,
        description: data.description,
        images: data.images,
        tags: data.tags,
        category: data.category,
        condition: data.condition,
        mode: data.mode,
        price: data.price,
        desiredTags: data.desiredTags,
        desiredText: data.desiredText,
        ownerId: user.id,
        location: {
          address: data.location,
          lat: user.location.lat,
          lng: user.location.lng
        },
        status: 'active'
      });

      toast({
        title: 'Item listed successfully!',
        description: 'Your item is now live in the marketplace.',
      });

      navigate('/marketplace');
    } catch (error) {
      toast({
        title: 'Failed to list item',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Plus className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Login to Add Items
          </h2>
          <p className="text-muted-foreground mb-6">
            Join Looply to start sharing items with your community.
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">Add New Item</h1>
            <p className="text-muted-foreground">
              Share something amazing with your community
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Mode Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>What would you like to do?</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            {modeOptions.map((option) => (
                              <div key={option.value}>
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor={option.value}
                                  className={cn(
                                    "flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    "hover:shadow-card peer-checked:shadow-elevated",
                                    selectedMode === option.value ? option.color : "border-muted"
                                  )}
                                >
                                  <div className="flex items-center space-x-3 mb-2">
                                    <option.icon className="h-6 w-6" />
                                    <h3 className="font-semibold">{option.title}</h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {option.description}
                                  </p>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      {selectedImages.length < 5 && (
                        <label className="aspect-square border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground text-center">
                            Add Photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add up to 5 photos. The first photo will be the main image.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Vintage Leather Jacket"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your item in detail..."
                            rows={4}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditionOptions.map((condition) => (
                                <SelectItem key={condition.value} value={condition.value}>
                                  {condition.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Price field for sell mode */}
                  {selectedMode === 'sell' && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="number"
                                placeholder="0.00"
                                className="pl-10"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <FormLabel>Add Tags *</FormLabel>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(tagInput);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addTag(tagInput)}
                        disabled={!tagInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {/* Common Tags */}
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Popular tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {commonTags.slice(0, 10).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={() => addTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Selected Tags */}
                    {currentTags.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Your tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {currentTags.map((tag, index) => (
                            <Badge key={index} variant="default" className="pr-1">
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                onClick={() => form.setValue('tags', currentTags.filter((_, i) => i !== index))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Barter Preferences */}
              {selectedMode === 'barter' && (
                <Card>
                  <CardHeader>
                    <CardTitle>What are you looking for?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="desiredText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe what you'd like to trade for..."
                              rows={3}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormLabel>Desired Tags</FormLabel>
                      <div className="flex space-x-2 mt-2">
                        <Input
                          placeholder="Add desired tag..."
                          value={desiredTagInput}
                          onChange={(e) => setDesiredTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addDesiredTag(desiredTagInput);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addDesiredTag(desiredTagInput)}
                          disabled={!desiredTagInput.trim()}
                        >
                          Add
                        </Button>
                      </div>

                      {currentDesiredTags.length > 0 && (
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-2">
                            {currentDesiredTags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="pr-1">
                                {tag}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                  onClick={() => form.setValue('desiredTags', currentDesiredTags.filter((_, i) => i !== index))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="City, State or Address"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/marketplace')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Publish Item
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;