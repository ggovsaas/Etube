'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  age: number;
  phone: string;
  services: string[];
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const SERVICES = [
  'Webcam',
  'BDSM',
  'Massagem',
  'Sexo Oral',
  'Sexo Anal',
  'Beijo na Boca',
  'Fetiche',
  'Casais',
  'A Domicílio',
  'Com Local',
  'Viagens',
  'Eventos',
  'Noite Inteira',
  'Rapidinha'
];

// NOTE: These fields don't exist in the current Listing model in Prisma schema
// Commented out until DB schema is updated to include these fields
// const HAIR_COLORS = ['Loira', 'Morena', 'Ruiva', 'Negra', 'Castanha', 'Colorida'];
// const NATIONALITIES = ['Brasileira', 'Portuguesa', 'Colombiana', 'Venezuelana', 'Angolana', 'Outra'];

const STATUSES = ['ACTIVE', 'PENDING', 'INACTIVE', 'REJECTED'];

export default function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (id !== 'new') {
      fetchListing();
    } else {
      setListing({
        id: '',
        title: '',
        description: '',
        price: 0,
        location: '',
        city: '',
        age: 0,
        phone: '',
        services: [],
        status: 'PENDING',
        userId: '',
        createdAt: '',
        updatedAt: ''
      });
      setLoading(false);
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/admin/listings/${id}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      const data = await response.json();
      setListing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/listings/${id === 'new' ? '' : id}`, {
        method: id === 'new' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing),
      });

      if (!response.ok) throw new Error('Failed to save listing');
      
      router.push('/admin/listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing');
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!listing) return;
    
    const { name, value, type } = e.target;
    setListing({
      ...listing,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleServiceToggle = (service: string) => {
    if (!listing) return;

    setListing({
      ...listing,
      services: listing.services.includes(service)
        ? listing.services.filter(s => s !== service)
        : [...listing.services, service]
    });
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!listing) return <div className="p-8">Listing not found</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {id === 'new' ? 'Create New Listing' : 'Edit Listing'}
          </h1>
          <Link
            href="/admin/listings"
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Listings
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={listing.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={listing.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={listing.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={listing.age}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={listing.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              {/* COMMENTED: These fields don't exist in Listing model
              <div>
                <label className="block text-sm font-medium text-gray-700">Nationality</label>
                <select name="nationality" className="mt-1 block w-full rounded-md border-gray-300">
                  <option value="">Select Nationality</option>
                  {NATIONALITIES.map(nat => <option key={nat} value={nat}>{nat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hair Color</label>
                <select name="hairColor" className="mt-1 block w-full rounded-md border-gray-300">
                  <option value="">Select Hair Color</option>
                  {HAIR_COLORS.map(color => <option key={color} value={color}>{color}</option>)}
                </select>
              </div>
              */}
            </div>
          </div>

          {/* COMMENTED: Physical Information section - fields don't exist in Listing model
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Physical Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input type="number" name="height" className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input type="number" name="weight" className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
            </div>
          </div>
          */}

          {/* Services */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SERVICES.map(service => (
                <label key={service} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={listing.services.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{service}</span>
                </label>
              ))}
            </div>
          </div>

          {/* COMMENTED: Tags section - tags field doesn't exist in Listing model
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>
            ... tag management UI ...
          </div>
          */}

          {/* Price and Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Price and Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (€/hour)</label>
                <input
                  type="number"
                  name="price"
                  value={listing.price || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={listing.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              {/* COMMENTED: isVerified and isActive don't exist in Listing model
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={listing.isVerified} />
                  <span className="text-sm text-gray-700">Verified</span>
                </label>
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={listing.isActive} />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
              */}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <textarea
              name="description"
              value={listing.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 