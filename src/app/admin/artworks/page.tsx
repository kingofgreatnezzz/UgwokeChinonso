'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { artworkApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from '@/components/ui/modal';
import { PageLoader, TableRowSkeleton } from '@/components/ui/loading';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Image,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Artwork } from '@/types';
import { formatPrice, formatDate, getPrimaryImageUrl } from '@/lib/utils';

export default function ArtworksPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Artwork | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await artworkApi.getArtworks({
        page,
        limit: 12,
        search: searchQuery || undefined,
      });
      setArtworks(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch {
      toast.error('Failed to load artworks');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await artworkApi.deleteArtwork(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      fetchArtworks();
    } catch {
      toast.error('Failed to delete artwork');
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArtworks();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">Artworks</h1>
          <p className="mt-1 text-stone-500">Manage your artwork inventory</p>
        </div>
        <Link href="/admin/artworks/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Add New Artwork</Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search artworks by title or topic…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <Button type="submit" variant="secondary" size="md">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-5">
              <table className="w-full">
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={7} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : artworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Image className="mb-4 h-16 w-16 text-stone-200" />
              <h3 className="text-lg font-semibold text-stone-700">No artworks found</h3>
              <p className="mt-1 text-sm text-stone-500">
                {searchQuery
                  ? 'Try adjusting your search.'
                  : 'Start by adding your first artwork.'}
              </p>
              {!searchQuery && (
                <Link href="/admin/artworks/new" className="mt-4">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>Add Artwork</Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="px-4 py-3 font-medium text-stone-500">Image</th>
                      <th className="px-4 py-3 font-medium text-stone-500">Title</th>
                      <th className="px-4 py-3 font-medium text-stone-500">Type</th>
                      <th className="px-4 py-3 font-medium text-stone-500">Price</th>
                      <th className="px-4 py-3 font-medium text-stone-500">Featured</th>
                      <th className="px-4 py-3 font-medium text-stone-500">Stock</th>
                      <th className="px-4 py-3 font-medium text-stone-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artworks.map((artwork) => {
                      const imgUrl = getPrimaryImageUrl(artwork.images);
                      return (
                        <tr
                          key={artwork.id}
                          className="border-b border-stone-100 transition-colors hover:bg-stone-50"
                        >
                          <td className="px-4 py-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-stone-100">
                              <img
                                src={imgUrl}
                                alt={artwork.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-stone-900 truncate max-w-[200px]">
                                {artwork.title}
                              </p>
                              <p className="text-xs text-stone-400 truncate max-w-[200px]">
                                {artwork.topic}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize text-stone-600">{artwork.type}</td>
                          <td className="px-4 py-3">
                            {artwork.salePrice ? (
                              <div>
                                <span className="font-medium text-amber-600">
                                  {formatPrice(artwork.salePrice)}
                                </span>
                                <span className="ml-1.5 text-xs text-stone-400 line-through">
                                  {formatPrice(artwork.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium text-stone-900">
                                {formatPrice(artwork.price)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={artwork.featured ? 'success' : 'default'}>
                              {artwork.featured ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={artwork.inStock ? 'success' : 'danger'}>
                              {artwork.inStock ? `${artwork.quantity} in stock` : 'Out of stock'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/admin/artworks/${artwork.id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteTarget(artwork)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3">
                  <p className="text-sm text-stone-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Artwork</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action
              cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ModalClose>
            <Button
              variant="danger"
              loading={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Deleting…' : 'Delete Artwork'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
