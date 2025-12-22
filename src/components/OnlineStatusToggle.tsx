'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface OnlineStatusToggleProps {
  initialStatus?: boolean;
  onStatusChange?: (isOnline: boolean) => void;
}

export default function OnlineStatusToggle({ 
  initialStatus = false,
  onStatusChange 
}: OnlineStatusToggleProps) {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchOnlineStatus();
    }
  }, [session]);

  const fetchOnlineStatus = async () => {
    try {
      const response = await fetch('/api/user/online-status');
      if (response.ok) {
        const data = await response.json();
        setIsOnline(data.isOnline ?? false);
      }
    } catch (error) {
      console.error('Error fetching online status:', error);
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/online-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOnline: !isOnline }),
      });

      if (response.ok) {
        const newStatus = !isOnline;
        setIsOnline(newStatus);
        onStatusChange?.(newStatus);
      } else {
        console.error('Failed to update online status');
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">
        {isOnline ? 'Online' : 'Offline'}
      </span>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
          isOnline ? 'bg-green-500' : 'bg-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isOnline ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
    </div>
  );
}


