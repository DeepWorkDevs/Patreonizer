import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palmtree, Loader2 } from 'lucide-react';
import { signIn, signUp } from '../lib/auth';
import { useStore } from '../store';

interface Props {
  isSignUp?: boolean;
}

export default function Welcome({ isSignUp = false }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useStore(state => state.user);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUp(email, password);
        // Show success message for sign up
        setError('Please check your email to verify your account');
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-3xl p-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-2xl mx-auto flex items-center justify-center">
            <Palmtree className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        
        <p className="text-xl text-zinc-400 mb-8 text-center">
          {isSignUp 
            ? 'Join thousands of creators using Patronizer'
            : 'Sign in to access your dashboard'
          }
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f45d48]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f45d48]"
              required
            />
          </div>

          {error && (
            <div className="text-[#f45d48] text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-xl text-white text-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Palmtree className="w-5 h-5" />
            )}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => navigate(isSignUp ? '/login' : '/signup')}
            className="w-full text-[#f45d48] text-sm hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-500 text-center">
          By connecting, you agree to our{' '}
          <a href="#" className="text-[#f45d48] hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#f45d48] hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}