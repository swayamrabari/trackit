/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import logo from '../assets/trackit.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const { register, isLoading, clearError, startDemo } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading('Registering...', { id: 'register' });
    clearError();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match", { id: 'register' });
      return;
    }
    try {
      await register(name, email, password);
      toast.success('Verification code sent to your mail!', {
        id: 'register',
      });
      navigate('/verify', { state: { email } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong', {
        id: 'register',
      });
    }
  };

  const handleDemo = async () => {
    clearError();
    setDemoLoading(true);
    toast.loading('Setting up demo...', { id: 'demo' });
    try {
      await startDemo();
      toast.success('Welcome to the demo!', { id: 'demo' });
      navigate('/');
    } catch (err: any) {
      toast.error('Demo setup failed. Please try again.', { id: 'demo' });
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center bg-background">
      <div className="login-container h-fit w-[320px]">
        <img src={logo} alt="TrackIt Logo" className="w-12 mb-5 mx-auto" />
        <h2 className="text-2xl font-bold mb-0.5 text-center">
          Create an Account
        </h2>
        <p className="description text-center font-semibold text-muted-foreground mb-6">
          {/* short description */}
          Fill in your details to get started
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2 block">
              Name
            </Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border-2 ring-0"
              disabled={isLoading}
              placeholder="Enter your name"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="email" className="mb-2 block">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-2 ring-0"
              disabled={isLoading}
              placeholder="Enter your email"
              autoComplete="off"
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-2 block">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-2 ring-0"
              disabled={isLoading}
              placeholder="Enter your password"
              autoComplete="off"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="mb-2 block">
              Confirm Password
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border-2 ring-0"
              disabled={isLoading}
              placeholder="Re-enter your password"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-semibold"
            disabled={isLoading}
            variant={'secondary'}
            data-testid="register-button"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full font-semibold"
          disabled={isLoading || demoLoading}
          onClick={handleDemo}
        >
          {demoLoading ? 'Setting up...' : 'Try Demo'}
        </Button>
        <p className="mt-4 font-semibold text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
