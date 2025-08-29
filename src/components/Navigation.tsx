import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, Search, Heart, MessageCircle, User, Plus,
  Menu, X, Gift, ArrowUpDown, DollarSign, ShoppingBag
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

const Navigation = ({ className }: NavigationProps) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role-based navigation
  const getUserNavItems = () => {
    if (user?.role === 'ngo') {
      return [
        { path: '/ngo-dashboard', icon: Home, label: 'Dashboard', description: 'NGO management' },
        { path: '/forums', icon: MessageCircle, label: 'Forums', description: 'Community discussions' },
        { path: '/settings', icon: User, label: 'Settings', description: 'Account & preferences' }
      ];
    }
    return [
      { path: '/', icon: Home, label: 'Marketplace', description: 'Browse all items' },
      { path: '/swipe', icon: Heart, label: 'Swipe', description: 'Discover & match' },
      { path: '/messages', icon: MessageCircle, label: 'Messages', description: 'Your conversations' },
      { path: '/forums', icon: MessageCircle, label: 'Forums', description: 'Community discussions' },
      { path: '/settings', icon: User, label: 'Settings', description: 'Account & preferences' }
    ];
  };

  const navItems = getUserNavItems();

  const modeIcons = {
    gift: Gift,
    barter: ArrowUpDown,
    sell: DollarSign,
    buy: ShoppingBag
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || 
           (path === '/' && location.pathname === '/marketplace');
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn(
        "hidden md:flex items-center justify-between p-4 bg-card shadow-card border-b border-border",
        className
      )}>
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <motion.div 
            className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Gift className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Looply</h1>
            <p className="text-xs text-muted-foreground">Gift • Barter • Sell • Buy</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center space-x-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path}>
              <Button
                variant={isActiveRoute(path) ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center space-x-2",
                  isActiveRoute(path) && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* Add Item & User Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              {user?.role !== 'ngo' && (
                <Link to="/add-item">
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </Link>
              )}
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border-2 border-primary"
                />
                {user?.role === 'ngo' && (
                  <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                    NGO
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-card border-b border-border">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Looply</span>
          </Link>

          <div className="flex items-center space-x-2">
            {isAuthenticated && user?.role !== 'ngo' && (
              <Link to="/add-item">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Navigation Links */}
              {navItems.map(({ path, icon: Icon, label, description }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                    isActiveRoute(path)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-xs opacity-70">{description}</div>
                  </div>
                </Link>
              ))}

              {/* Auth Section */}
              <div className="border-t border-border pt-3 mt-3">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3 p-3">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full border-2 border-primary"
                    />
                    <div>
                      <div className="font-medium text-foreground">{user?.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                        <span>{user?.email}</span>
                        {user?.role === 'ngo' && (
                          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                            NGO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full justify-start">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Bottom Tab Bar (Mobile) */}
      {isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
          <div className="flex items-center justify-around py-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors",
                  isActiveRoute(path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
                {isActiveRoute(path) && (
                  <motion.div
                    className="w-1 h-1 bg-primary rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;