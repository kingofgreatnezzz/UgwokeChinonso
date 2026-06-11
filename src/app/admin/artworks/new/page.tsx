'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { artworkApi, collectionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageLoader } from '@/components/ui/loading';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Upload,
} from 'lucide-react';
import { slugify } from '@/lib/utils';
import type { Collection } from '@/types';

const artworkTypes = [
  { value: 'painting', label: 'Painting' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'photography', label: 'Photography' },
  { value: 'digital', label: 'Digital' },
  { value: 'mixed-media', label: 'Mixed Media' },
  { value: 'print', label: 'Print' },
  { value: 'drawing', label: 'Drawing' },
  { value: 'ceramics', label: 'Ceramics' },
  { value: 'textile', label: 'Textile' },
  { value: 'other', label: 'Other' },
];

const artworkSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  topic: z.string().min(2, 'Topic is required'),
  type: z.string().min(1, 'Type is required'),
  size: z.string().min(1, 'Size is required'),
  price: z.number({ message: 'Price must be a number' }).positive('Price must be greater than 0'),
  salePrice: z.number().optional().nullable(),
  quantity: z.number({ message: 'Quantity must be a number' }).int().min(0, 'Quantity cannot be negative'),
  featured: z.boolean(),
  inStock: z.boolean(),
  collectionId: z.string().optional().nullable(),
});

type ArtworkFormData = z.infer<typeof artworkSchema>;

interface ImagePreview {
  id: string;
  file: File;
  previewUrl: string;
}

export default function NewArtworkPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArtworkFormData>({
    resolver: zodResolver(artworkSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      topic: '',
      type: '',
      size: '',
      price: undefined,
      salePrice: undefined,
      quantity: 1,
      featured: false,
      inStock: true,
      collectionId: undefined,
    },
  });

  const title = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      setValue('slug', slugify(title));
    }
  }, [title, setValue]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await collectionApi.getCollections();
        setCollections(data);
      } catch {
        // collections may not be available
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const handleImageSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: ImagePreview[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) URL.revokeObjectURL(image.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleImageSelect(e.dataTransfer.files);
  }, [handleImageSelect]);

  const onSubmit = async (data: ArtworkFormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('slug', data.slug);
      formData.append('description', data.description);
      formData.append('topic', data.topic);
      formData.append('type', data.type);
      formData.append('size', data.size);
      formData.append('price', String(data.price));
      if (data.salePrice) formData.append('salePrice', String(data.salePrice));
      formData.append('quantity', String(data.quantity));
      formData.append('featured', String(data.featured));
      formData.append('inStock', String(data.inStock));
      if (data.collectionId) formData.append('collectionId', data.collectionId);

      images.forEach((image) => {
        formData.append('images', image.file);
      });

      await artworkApi.createArtwork(formData);
      toast.success('Artwork created successfully!');
      router.push('/admin/artworks');
    } catch (error: unknown) {
      const err = error as { friendlyMessage?: string };
      toast.error(err.friendlyMessage || 'Failed to create artwork');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoader text="Loading form…" />;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Artworks
        </button>
        <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">Add New Artwork</h1>
        <p className="mt-1 text-stone-500">Add a new piece to your portfolio</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Title, description, and categorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Title"
                placeholder="Artwork title"
                error={errors.title?.message}
                {...register('title')}
              />
              <Input
                label="Slug"
                placeholder="auto-generated"
                error={errors.slug?.message}
                {...register('slug')}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">Description</label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="Describe your artwork…"
                className={`w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  errors.description ? 'border-red-400' : ''
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Input
                label="Topic / Subject"
                placeholder="e.g. Abstract, Nature"
                error={errors.topic?.message}
                {...register('topic')}
              />
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Type</label>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <SelectTrigger className={errors.type ? 'border-red-400' : ''}>
                        <SelectValue placeholder="Select type…" />
                      </SelectTrigger>
                      <SelectContent>
                        {artworkTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>
                    )}
                  </div>
                )}
              />
              <Input
                label="Size / Dimensions"
                placeholder="e.g. 24x36 in"
                error={errors.size?.message}
                {...register('size')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
            <CardDescription>Price, stock, and collection assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
              <Input
                label="Price (₦)"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.price?.message}
                {...register('price')}
              />
              <Input
                label="Sale Price (₦)"
                type="number"
                step="0.01"
                placeholder="Optional"
                error={errors.salePrice?.message}
                {...register('salePrice')}
              />
              <Input
                label="Quantity"
                type="number"
                placeholder="1"
                error={errors.quantity?.message}
                {...register('quantity')}
              />
              <Controller
                name="collectionId"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Collection</label>
                    <Select
                      onValueChange={(val) => field.onChange(val === 'none' ? undefined : val)}
                      value={field.value || 'none'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {collections.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-stone-700">Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('inStock')}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-stone-700">In Stock</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Upload artwork images (first image will be primary)</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
                dragOver
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-stone-300 bg-stone-50 hover:border-amber-400 hover:bg-amber-50/50'
              }`}
            >
              <Upload className="mb-3 h-8 w-8 text-stone-400" />
              <p className="text-sm font-medium text-stone-700">
                Drag & drop images here, or click to browse
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Supports JPG, PNG, WebP — up to 10MB each
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files)}
              />
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                  <div key={image.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg bg-stone-100">
                      <img
                        src={image.previewUrl}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-medium text-white">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
            size="lg"
          >
            {isSubmitting ? 'Creating…' : 'Create Artwork'}
          </Button>
        </div>
      </form>
    </div>
  );
}
