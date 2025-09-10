import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import Swipe from "./pages/Swipe";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AddItem from "./pages/AddItem";
import SavedItems from "./pages/SavedItems";
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
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/swipe" element={<Swipe />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/saved-items" element={<SavedItems />} />
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
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
