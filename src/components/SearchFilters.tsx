import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, SlidersHorizontal, MapPin, DollarSign 
} from 'lucide-react';
import { ItemMode, ItemCondition, SearchFilters } from '@/types';
import { categories } from '@/data/mockData';
import { useFiltersStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  className?: string;
  compact?: boolean;
}

const SearchFiltersComponent = ({ className, compact = false }: SearchFiltersProps) => {
  const { filters, updateFilters, resetFilters } = useFiltersStore();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const modes: { value: ItemMode; label: string; icon: string }[] = [
    { value: 'gift', label: 'Gift', icon: '🎁' },
    { value: 'barter', label: 'Barter', icon: '🔄' },
    { value: 'sell', label: 'Sell', icon: '💰' },
    { value: 'buy', label: 'Buy', icon: '🛒' }
  ];

  const conditions: { value: ItemCondition; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const ownerTypes = [
    { value: 'user' as const, label: 'Individual Users' },
    { value: 'ngo' as const, label: 'NGOs Only' }
  ];

  const handleQueryChange = (query: string) => {
    updateFilters({ query });
  };

  const toggleMode = (mode: ItemMode) => {
    const newModes = filters.modes.includes(mode)
      ? filters.modes.filter(m => m !== mode)
      : [...filters.modes, mode];
    updateFilters({ modes: newModes });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const toggleCondition = (condition: ItemCondition) => {
    const newConditions = filters.condition.includes(condition)
      ? filters.condition.filter(c => c !== condition)
      : [...filters.condition, condition];
    updateFilters({ condition: newConditions });
  };

  const toggleOwnerType = (ownerType: 'user' | 'ngo') => {
    const newOwnerTypes = filters.ownerTypes.includes(ownerType)
      ? filters.ownerTypes.filter(t => t !== ownerType)
      : [...filters.ownerTypes, ownerType];
    updateFilters({ ownerTypes: newOwnerTypes });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.modes.length > 0) count++;
    if (filters.condition.length > 0) count++;
    if (filters.ownerTypes.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    return count;
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Modes Filter */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          {modes.map(({ value, label, icon }) => (
            <Button
              key={value}
              variant={filters.modes.includes(value) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMode(value)}
              className="justify-start"
            >
              <span className="mr-2">{icon}</span>
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Categories Filter */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Categories</h3>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground flex items-center">
          <DollarSign className="h-4 w-4 mr-1" />
          Price Range
        </h3>
        <div className="space-y-3">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
            min={0}
            max={10000}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Condition Filter */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Condition</h3>
        <div className="space-y-2">
          {conditions.map(({ value, label }) => (
            <label key={value} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.condition.includes(value)}
                onCheckedChange={() => toggleCondition(value)}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Owner Type Filter */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Owner Type</h3>
        <div className="space-y-2">
          {ownerTypes.map(({ value, label }) => (
            <label key={value} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.ownerTypes.includes(value)}
                onCheckedChange={() => toggleOwnerType(value)}
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="font-semibold mb-3 text-foreground">Sort By</h3>
        <Select 
          value={filters.sortBy} 
          onValueChange={(value) => updateFilters({ sortBy: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="distance">Nearest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Filters */}
      <div className="pt-4 border-t border-border">
        <Button 
          variant="outline" 
          onClick={resetFilters}
          className="w-full"
          disabled={getActiveFiltersCount() === 0}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items, tags..."
            value={filters.query || ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Mobile Filters */}
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {getActiveFiltersCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96">
            <SheetHeader>
              <SheetTitle className="flex items-center">
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for items, tags, or descriptions..."
          value={filters.query || ''}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-12 pr-4 h-12 text-base"
        />
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {getActiveFiltersCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filters.modes.map(mode => (
              <Badge
                key={mode}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleMode(mode)}
              >
                {mode} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.categories.map(category => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleCategory(category)}
              >
                {category} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Filters */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="flex items-center">
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FiltersContent />
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchFiltersComponent;