import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect authenticated users to marketplace, others to landing
    if (isAuthenticated) {
      navigate('/marketplace');
    } else {
      navigate('/landing');
    }
  }, [isAuthenticated, navigate]);

  return null; // This component just redirects
};

export default Index;
