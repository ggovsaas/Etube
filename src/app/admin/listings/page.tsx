'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  city: string;
  description: string;
  age: number;
  price: number;
  services: string;
  status: string;
  user?: {
    email?: string;
    name?: string;
    profile?: {
      name: string;
    };
  };
}

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    // Update filtered listings when search term changes
    const filtered = listings.filter(listing => {
      const matchesSearch = 
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
    
    setFilteredListings(filtered);
  }, [listings, searchTerm]);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/admin/listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data);
      setFilteredListings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-listing/${listingId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to approve listing');
      
      // Refresh listings
      fetchListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve listing');
    }
  };

  const handleRejectListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/admin/reject-listing/${listingId}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to reject listing');
      
      // Refresh listings
      fetchListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject listing');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setDeleting(listingId);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setListings(prev => prev.filter(l => l.id !== listingId));
        setFilteredListings(prev => prev.filter(l => l.id !== listingId));
        alert('Listing deleted successfully!');
      } else {
        const data = await response.json();
        alert(`Error deleting listing: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert('Error deleting listing.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 sm:p-8 overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-black">Manage Listings</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/listings/new/edit"
            className="bg-red-600 text-white px-3 py-2 text-sm sm:px-4 rounded hover:bg-red-700 text-center"
          >
            + Add Listing
          </Link>
          <Link
            href="/admin"
            className="bg-gray-600 text-white px-3 py-2 text-sm sm:px-4 rounded hover:bg-gray-700 text-center"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow p-4 sm:p-6">
        <input
          type="text"
          placeholder="Search by title, city, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Listings Grid */}
      <div className="grid gap-4 sm:gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-black break-words">{listing.title}</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {listing.city} • Age: {listing.age} • €{listing.price}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words line-clamp-2">
                  {listing.description || 'No description'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                  By: {listing.user?.profile?.name || listing.user?.name || listing.user?.email || 'Unknown'}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className={`px-2 py-1 rounded text-xs sm:text-sm whitespace-nowrap ${
                  listing.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {listing.status}
                </span>
              </div>
            </div>

            <div className="mb-4 min-w-0">
              <h3 className="font-semibold mb-2 text-black text-sm">Services</h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words">{listing.services || 'No services listed'}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {listing.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleApproveListing(listing.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectListing(listing.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => router.push(`/admin/listings/${listing.id}/edit`)}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold text-left sm:text-center"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteListing(listing.id)}
                disabled={deleting === listing.id}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting === listing.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 