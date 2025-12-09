'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  profile?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/reviews');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReviews();
        alert('Review deleted successfully!');
      } else {
        const data = await response.json();
        alert(`Error deleting review: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Error deleting review.');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || review.rating.toString() === filter;
    
    const matchesSearch = !searchTerm || 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.profile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading reviews...</div>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-gray-600 mt-1">
            Average Rating: <span className="font-semibold">{averageRating}</span> / 5.00 ({reviews.length} reviews)
          </p>
        </div>
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
              placeholder="Search by comment, profile name, or user email..."
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
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => setFilter(rating.toString() as any)}
                className={`px-4 py-2 rounded-lg ${filter === rating.toString() ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {rating}⭐
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            All Reviews ({filteredReviews.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">No reviews found</div>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    )}
                    <div className="text-sm text-gray-600">
                      {review.profile && (
                        <div>Profile: <span className="font-medium">{review.profile.name}</span></div>
                      )}
                      {review.user && (
                        <div>User: <span className="font-medium">{review.user.name || review.user.email}</span></div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium ml-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
