import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Redirect based on authentication and user role
    if (isAuthenticated && user) {
      if (user.role === 'ngo') {
        navigate('/ngo-dashboard');
      } else {
        navigate('/marketplace');
      }
    } else {
      navigate('/landing');
    }
  }, [isAuthenticated, user, navigate]);

  return null; // This component just redirects
};

export default Index;
