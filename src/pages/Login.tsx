import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Gift } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { user, session } = await authApi.login(data.email, data.password);
      
      // Fetch user profile from database
      const userProfile = await usersApi.getCurrentUserProfile();
      
      if (userProfile) {
        login(userProfile);
        toast({
          title: 'Welcome back!',
          description: `Good to see you again, ${userProfile.name}!`,
        });
        navigate('/marketplace');
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check your credentials',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/landing">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-elevated">
            <CardHeader className="text-center pb-4">
              {/* Logo */}
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary-foreground" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-foreground">
                Welcome Back
              </CardTitle>
              <p className="text-muted-foreground">
                Sign in to continue to Looply
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              className="pl-10 pr-10"
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Login Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </Form>

              {/* Demo Accounts */}
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Try demo accounts:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.setValue('email', 'john@example.com');
                      form.setValue('password', 'password123');
                    }}
                    disabled={isLoading}
                  >
                    User Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.setValue('email', 'greenearth@ngo.org');
                      form.setValue('password', 'password123');
                    }}
                    disabled={isLoading}
                  >
                    NGO Demo
                  </Button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>

              {/* Guest Browse */}
              <div className="text-center">
                <Link to="/marketplace">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Continue as Guest
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Join thousands of users who are already:
          </p>
          <div className="flex justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-1">
              <Gift className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">Gifting</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Bartering</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Trading</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;