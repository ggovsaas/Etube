'use client';

import React from 'react';
import Link from 'next/link';
import { Gift } from 'lucide-react';

interface WishlistWidgetProps {
  creatorId?: string;
  locale?: 'pt' | 'es';
}

/**
 * WishlistWidget - Simple CTA button linking to creator's full wishlist page
 * Shows "Comprar Presente" / "Lista de desejos" button
 */
export default function WishlistWidget({ creatorId, locale = 'pt' }: WishlistWidgetProps) {
  if (!creatorId) {
    return null;
  }

  // Get current locale from pathname or use prop
  const getLocale = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/es/')) return 'es';
      if (path.startsWith('/pt/')) return 'pt';
    }
    return locale;
  };

  const currentLocale = getLocale();

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <Link
        href={`/${currentLocale}/wishlist/${creatorId}`}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200 rounded-lg transition-all group"
      >
        <Gift size={18} className="text-red-600 group-hover:scale-110 transition-transform" />
        <div className="text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            {currentLocale === 'es' ? 'Comprar Regalo' : 'Comprar Presente'}
          </p>
          <p className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
            {currentLocale === 'es' ? 'Lista de deseos' : 'Lista de desejos'}
          </p>
        </div>
        <span className="ml-auto text-xs font-bold text-red-600">
          →
        </span>
      </Link>
    </div>
  );
}

