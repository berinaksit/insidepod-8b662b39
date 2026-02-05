import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If already logged in, redirect to app
  if (!loading && user) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const result = signupSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(email, password);
    
    if (error) {
      let message = 'An error occurred during sign up';
      if (error.message.includes('already registered')) {
        message = 'This email is already registered. Please sign in instead.';
      }
      
      toast({
        title: 'Sign Up Failed',
        description: message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Account created',
      description: 'Please check your email to confirm your account, or sign in if email confirmation is disabled.',
    });
    
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-6 h-6 rounded-xl flex items-center justify-center bg-foreground">
            <span className="text-background font-display text-xl"></span>
          </div>
          <span className="font-display text-2xl text-foreground">Pōd</span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl p-8 shadow-card">
          <h1 className="text-xl font-medium text-foreground text-center mb-6">
            Create your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
