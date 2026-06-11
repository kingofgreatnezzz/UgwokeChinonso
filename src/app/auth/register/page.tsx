'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, Phone, Palette } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });
      loginStore(result.user, result.token);
      toast.success(`Welcome, ${result.user.name}! Your account has been created.`);
      router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as { friendlyMessage?: string };
      toast.error(err.friendlyMessage || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background artwork */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&q=80')] bg-cover bg-center opacity-20"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/95 via-stone-900/90 to-stone-950/95" />
        {/* Decorative elements */}
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-amber-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/20">
            <Palette className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">Artist Portfolio</h1>
          <p className="mt-2 text-stone-400">Create your account</p>
        </div>

        <Card className="border-stone-800/60 bg-stone-900/60 shadow-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-xl text-white">Join Us</CardTitle>
            <CardDescription className="text-stone-400">
              Create an account to start collecting art
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Your full name"
                icon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                {...register('name')}
                className="border-stone-700/60 bg-stone-800/50 text-white placeholder:text-stone-500 focus:border-amber-500/50"
                wrapperClassName="text-stone-200"
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
                className="border-stone-700/60 bg-stone-800/50 text-white placeholder:text-stone-500 focus:border-amber-500/50"
                wrapperClassName="text-stone-200"
              />

              <Input
                label="Phone (optional)"
                type="tel"
                placeholder="+234 800 000 0000"
                icon={<Phone className="h-4 w-4" />}
                error={errors.phone?.message}
                {...register('phone')}
                className="border-stone-700/60 bg-stone-800/50 text-white placeholder:text-stone-500 focus:border-amber-500/50"
                wrapperClassName="text-stone-200"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                  className="border-stone-700/60 bg-stone-800/50 text-white placeholder:text-stone-500 focus:border-amber-500/50"
                  wrapperClassName="text-stone-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-stone-400 transition-colors hover:text-stone-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                  className="border-stone-700/60 bg-stone-800/50 text-white placeholder:text-stone-500 focus:border-amber-500/50"
                  wrapperClassName="text-stone-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[38px] text-stone-400 transition-colors hover:text-stone-300"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Creating Account…' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-400">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-amber-400 transition-colors hover:text-amber-300"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
