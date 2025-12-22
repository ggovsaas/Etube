'use client';

import Link from 'next/link';

export default function Breadcrumb() {
  return (
    <div className="bg-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-red-600 inline-flex items-center">
                <i className="fas fa-home mr-2"></i>
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                <span className="text-gray-500">Perfis</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
} 