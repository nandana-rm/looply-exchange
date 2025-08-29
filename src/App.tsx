import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import Swipe from "./pages/Swipe";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AddItem from "./pages/AddItem";
import ItemDetail from "./pages/ItemDetail";
import LikedItems from "./pages/LikedItems";
import SavedItems from "./pages/SavedItems";
import MyListings from "./pages/MyListings";
import NGODashboard from "./pages/NGODashboard";
import Forums from "./pages/Forums";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./lib/store";
import { cn } from "./lib/utils";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className={cn(
        "transition-all duration-200",
        isAuthenticated && "pb-20 md:pb-0" // Add bottom padding for mobile nav
      )}>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/swipe" element={<Swipe />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/liked" element={<LikedItems />} />
          <Route path="/saved" element={<SavedItems />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/ngo-dashboard" element={<NGODashboard />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
