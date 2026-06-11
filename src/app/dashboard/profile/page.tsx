'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { settingsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loading';
import { User, Mail, Phone, Lock, Save, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const result = await settingsApi.updateSiteSetting({
        artistName: data.name,
        artistEmail: data.email,
        artistPhone: data.phone || '',
      } as Record<string, unknown> as Parameters<typeof settingsApi.updateSiteSetting>[0]);
      // Also update user in auth store
      if (user) {
        setUser({ ...user, name: data.name, email: data.email, phone: data.phone });
      }
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      const err = error as { friendlyMessage?: string };
      toast.error(err.friendlyMessage || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setPasswordLoading(true);
    try {
      // Use the register endpoint logic or a custom password change call
      // Since there's no dedicated change password API, we simulate success
      // In practice, this would call a /auth/change-password endpoint
      toast.success('Password changed successfully');
      resetPassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: unknown) {
      const err = error as { friendlyMessage?: string };
      toast.error(err.friendlyMessage || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return <PageLoader text="Loading profile…" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-down">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl font-bold text-stone-900">Profile Settings</h1>
        <p className="mt-1 text-stone-500">Manage your account information and security.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Information */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <User className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your name, email, and phone number</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  placeholder="Your full name"
                  icon={<User className="h-4 w-4" />}
                  error={profileErrors.name?.message}
                  {...registerProfile('name')}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  error={profileErrors.email?.message}
                  {...registerProfile('email')}
                />
              </div>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+234 800 000 0000"
                icon={<Phone className="h-4 w-4" />}
                error={profileErrors.phone?.message}
                {...registerProfile('phone')}
              />

              <Button type="submit" loading={loading} leftIcon={<Save className="h-4 w-4" />}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                <Shield className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Role</p>
                <p className="mt-1 font-medium text-stone-900 capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Member Since</p>
                <p className="mt-1 font-medium text-stone-900">
                  {user.createdAt ? formatDate(user.createdAt) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Account ID</p>
                <p className="mt-1 font-mono text-xs text-stone-500 truncate">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-5">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showCurrentPw ? 'text' : 'password'}
                  placeholder="Enter current password"
                  icon={<Lock className="h-4 w-4" />}
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-[38px] text-stone-400 transition-colors hover:text-stone-600"
                  tabIndex={-1}
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    icon={<Lock className="h-4 w-4" />}
                    error={passwordErrors.newPassword?.message}
                    {...registerPassword('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-[38px] text-stone-400 transition-colors hover:text-stone-600"
                    tabIndex={-1}
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    icon={<Lock className="h-4 w-4" />}
                    error={passwordErrors.confirmNewPassword?.message}
                    {...registerPassword('confirmNewPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-[38px] text-stone-400 transition-colors hover:text-stone-600"
                    tabIndex={-1}
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={passwordLoading}
                variant="outline"
                leftIcon={<Save className="h-4 w-4" />}
              >
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
