'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Metrics {
  siteHealth: {
    totalUsers: number;
    totalListings: number;
    newUsersLast7Days: number;
    activeListings: number;
    newCreatorsLast7Days: number;
    newClientOnlyUsersLast7Days: number;
    userRolesBreakdown: {
      clients: number;
      creators: number;
      providers: number;
      camCreators: number;
      total: number;
    };
  };
  monetization: {
    totalRevenueLast30Days: number;
    creditSalesLast7Days: number;
    contestRevenue: number;
    directChatRevenue: number;
    videoViewsPaid: number;
    tipsProcessed: number;
    creatorPayoutLiability: number;
    arpu: number;
  } | null;
  compliance: {
    pendingListingApproval: number;
    pendingPhotoVerification: number;
    pendingIdVerification: number | null;
    newBlogPostsUnmoderated: number;
    reportedProfilesActive: number;
    totalAccountsBannedLast30Days: number;
  };
  community: {
    newForumThreadsLast24h: number;
    activeContestsTotal: number;
    activeBloggersLast7Days: number;
    wishlistItemsCreated: number;
    totalBlogPostsPublished: number;
    avgSessionDuration: number;
  } | null;
  service: {
    directChatSessionsTotal: number;
    contestEntriesTotal: number;
    premiumSubscriptionsActive: number;
    tvTubeViews: number;
  } | null;
  countryScope: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        console.error('Failed to fetch metrics:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { signOut } = await import('next-auth/react');
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load metrics</p>
          <button 
            onClick={fetchMetrics}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Scope: <span className="font-semibold">{metrics.countryScope}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Sair
          </button>
        </div>
      </div>

      {/* 1. Site Health & Growth */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Site Health & Growth</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <MetricCard
            icon="👥"
            label="Total Users"
            value={metrics.siteHealth.totalUsers}
            color="blue"
          />
          <MetricCard
            icon="📋"
            label="Total Listings"
            value={metrics.siteHealth.totalListings}
            color="green"
          />
          <MetricCard
            icon="🆕"
            label="New Users (7d)"
            value={metrics.siteHealth.newUsersLast7Days}
            color="purple"
          />
          <MetricCard
            icon="✅"
            label="Active Listings"
            value={metrics.siteHealth.activeListings}
            color="yellow"
          />
          <MetricCard
            icon="🎨"
            label="New Creators (7d)"
            value={metrics.siteHealth.newCreatorsLast7Days}
            color="indigo"
          />
          <MetricCard
            icon="🛒"
            label="New Clients (7d)"
            value={metrics.siteHealth.newClientOnlyUsersLast7Days}
            color="pink"
          />
        </div>
        
        {/* User Roles Breakdown */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">User Roles Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{metrics.siteHealth.userRolesBreakdown.clients}</p>
              <p className="text-sm text-gray-600">Clients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{metrics.siteHealth.userRolesBreakdown.creators}</p>
              <p className="text-sm text-gray-600">Content Creators</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{metrics.siteHealth.userRolesBreakdown.providers}</p>
              <p className="text-sm text-gray-600">Service Providers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{metrics.siteHealth.userRolesBreakdown.camCreators}</p>
              <p className="text-sm text-gray-600">CAM Creators</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monetization & Sales (Master Admin Only) */}
      {metrics.monetization && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💵 Monetization & Sales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <MetricCard
              icon="💰"
              label="Revenue (30d)"
              value={formatCurrency(metrics.monetization.totalRevenueLast30Days)}
              color="green"
            />
            <MetricCard
              icon="💳"
              label="Credit Sales (7d)"
              value={formatCurrency(metrics.monetization.creditSalesLast7Days)}
              color="blue"
            />
            <MetricCard
              icon="🎯"
              label="ARPU"
              value={formatCurrency(metrics.monetization.arpu)}
              color="purple"
            />
            <MetricCard
              icon="🎲"
              label="Contest Revenue"
              value={formatCurrency(metrics.monetization.contestRevenue)}
              color="yellow"
            />
            <MetricCard
              icon="💬"
              label="Chat/Call Revenue"
              value={formatCurrency(metrics.monetization.directChatRevenue)}
              color="indigo"
            />
            <MetricCard
              icon="🎬"
              label="Video Views (Paid)"
              value={metrics.monetization.videoViewsPaid.toLocaleString()}
              color="pink"
            />
            <MetricCard
              icon="💝"
              label="Tips Processed"
              value={formatCurrency(metrics.monetization.tipsProcessed)}
              color="red"
            />
            <MetricCard
              icon="💸"
              label="Creator Payout Liability"
              value={formatCurrency(metrics.monetization.creatorPayoutLiability)}
              color="orange"
            />
          </div>
        </div>
      )}

      {/* 3. Compliance & Content Moderation */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🛡️ Compliance & Content Moderation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/pending-listings">
            <MetricCard
              icon="⏳"
              label="Pending Listing Approval"
              value={metrics.compliance.pendingListingApproval}
              color="yellow"
              clickable
            />
          </Link>
          <Link href="/admin/verifications">
            <MetricCard
              icon="📸"
              label="Pending Photo Verification"
              value={metrics.compliance.pendingPhotoVerification}
              color="orange"
              clickable
            />
          </Link>
          {metrics.compliance.pendingIdVerification !== null && (
            <MetricCard
              icon="🆔"
              label="Pending ID Verification"
              value={metrics.compliance.pendingIdVerification}
              color="red"
            />
          )}
          <Link href="/admin/blog">
            <MetricCard
              icon="📝"
              label="Unmoderated Blog Posts"
              value={metrics.compliance.newBlogPostsUnmoderated}
              color="blue"
              clickable
            />
          </Link>
          <MetricCard
            icon="⚠️"
            label="Reported Profiles (Active)"
            value={metrics.compliance.reportedProfilesActive}
            color="red"
          />
          <MetricCard
            icon="🚫"
            label="Accounts Banned (30d)"
            value={metrics.compliance.totalAccountsBannedLast30Days}
            color="gray"
          />
        </div>
      </div>

      {/* 4. Community & Engagement (Master Admin Only) */}
      {metrics.community && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💬 Community & Engagement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              icon="💭"
              label="New Forum Threads (24h)"
              value={metrics.community.newForumThreadsLast24h}
              color="blue"
            />
            <Link href="/admin/contests">
              <MetricCard
                icon="🎲"
                label="Active Contests"
                value={metrics.community.activeContestsTotal}
                color="purple"
                clickable
              />
            </Link>
            <MetricCard
              icon="✍️"
              label="Active Bloggers (7d)"
              value={metrics.community.activeBloggersLast7Days}
              color="green"
            />
            <MetricCard
              icon="🎁"
              label="Wishlist Items Created"
              value={metrics.community.wishlistItemsCreated}
              color="pink"
            />
            <MetricCard
              icon="📰"
              label="Total Blog Posts Published"
              value={metrics.community.totalBlogPostsPublished}
              color="indigo"
            />
            <MetricCard
              icon="⏱️"
              label="Avg Session Duration"
              value={`${metrics.community.avgSessionDuration}s`}
              color="yellow"
            />
          </div>
        </div>
      )}

      {/* 5. Service Utilization (Master Admin Only) */}
      {metrics.service && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📞 Service Utilization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <MetricCard
              icon="💬"
              label="DirectChat Sessions (Total)"
              value={metrics.service.directChatSessionsTotal.toLocaleString()}
              color="blue"
            />
            <MetricCard
              icon="🎯"
              label="Contest Entries (Total)"
              value={metrics.service.contestEntriesTotal.toLocaleString()}
              color="purple"
            />
            <MetricCard
              icon="⭐"
              label="Premium Subscriptions (Active)"
              value={metrics.service.premiumSubscriptionsActive}
              color="yellow"
            />
            <MetricCard
              icon="📺"
              label="TV/Tube Views"
              value={metrics.service.tvTubeViews.toLocaleString()}
              color="green"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  color, 
  clickable = false 
}: { 
  icon: string; 
  label: string; 
  value: string | number; 
  color: string;
  clickable?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  const baseClasses = "p-3 sm:p-4 rounded-lg border border-gray-200";
  const clickableClasses = clickable ? "hover:shadow-md transition-shadow cursor-pointer" : "";

  return (
    <div className={`${baseClasses} ${clickableClasses}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-2 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
            <span className="text-lg sm:text-xl">{icon}</span>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">{label}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
