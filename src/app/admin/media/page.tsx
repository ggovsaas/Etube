'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MediaItem {
  id: string;
  url: string;
  type: string | null;
  profileId: string | null;
  listingId: string | null;
  createdAt: string;
  profile?: {
    id: string;
    name: string;
  };
  listing?: {
    id: string;
    title: string;
  };
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/media');
      
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      
      const data = await response.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching media:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media item? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMedia();
        alert('Media deleted successfully!');
      } else {
        const data = await response.json();
        alert(`Error deleting media: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      alert('Error deleting media.');
    }
  };

  const filteredMedia = media.filter(item => {
    const itemType = item.type?.toLowerCase() || '';
    const matchesFilter = filter === 'all' || 
      (filter === 'images' && (itemType.includes('image') || itemType === 'photo')) ||
      (filter === 'videos' && itemType.includes('video'));
    
    const matchesSearch = !searchTerm || 
      item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.listing?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading media...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Media Management</h1>
        <Link
          href="/admin" 
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by URL, profile name, or listing title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('images')}
              className={`px-4 py-2 rounded-lg ${filter === 'images' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Images
            </button>
            <button
              onClick={() => setFilter('videos')}
              className={`px-4 py-2 rounded-lg ${filter === 'videos' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Videos
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            All Media ({filteredMedia.length})
          </h2>
        </div>
        <div className="p-6">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">No media found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                    {item.type?.toLowerCase().includes('video') || item.type === 'VIDEO' ? (
                      <video src={item.url} className="w-full h-full object-cover" controls />
                    ) : (
                      <Image
                        src={item.url}
                        alt="Media"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-600 mb-2">
                      <div>Type: {item.type || 'Unknown'}</div>
                      {item.profile && (
                        <div>Profile: {item.profile.name}</div>
                      )}
                      {item.listing && (
                        <div>Listing: {item.listing.title}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
