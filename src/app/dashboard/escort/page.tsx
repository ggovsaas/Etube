"use client";

import React from 'react';
import Link from 'next/link';

export default function EscortDashboard() {
  // Mock data for demonstration
  const escortInfo = {
    name: "Isabella Santos",
    email: "isabella@email.com",
    status: "Ativa",
    isPremium: false,
  };

  const activeListings = [
    {
      id: "1",
      title: "Acompanhante em Lisboa",
      city: "Lisboa",
      isPremium: false,
      createdAt: "2024-06-09",
      status: "Ativo",
    },
    {
      id: "2",
      title: "Acompanhante VIP Porto",
      city: "Porto",
      isPremium: true,
      createdAt: "2024-05-20",
      status: "Ativo",
    },
  ];

  const finishedListings = [
    {
      id: "3",
      title: "Acompanhante Algarve",
      city: "Faro",
      isPremium: false,
      createdAt: "2024-04-10",
      status: "Finalizado",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Minha Conta</h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-pink-600">{escortInfo.name}</p>
              <p className="text-gray-700">{escortInfo.email}</p>
              <p className="text-sm text-gray-500">Status: <span className="font-medium text-green-600">{escortInfo.status}</span></p>
            </div>
            <div className="flex gap-4">
              {!escortInfo.isPremium && (
                <Link href="/dashboard/escort/upgrade" className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition">Upgrade para Premium</Link>
              )}
            </div>
          </div>
        </div>

        {/* Active Listings Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Listagens Ativas</h2>
          {activeListings.length === 0 ? (
            <p className="text-gray-500">Você não tem listagens ativas.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeListings.map(listing => (
                <div key={listing.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition group relative">
                  <h3 className="text-lg font-semibold text-pink-600 mb-1">{listing.title}</h3>
                  <p className="text-gray-700">Cidade: {listing.city}</p>
                  <p className="text-gray-500 text-sm">Criado em: {listing.createdAt}</p>
                  <span className="absolute top-2 right-2 bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded">{listing.status}</span>
                  {listing.isPremium && <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">Premium</span>}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/anuncio/${listing.id}`} className="text-blue-600 hover:underline text-sm">Ver</Link>
                    <Link href={`/dashboard/escort/edit-listing/${listing.id}`} className="text-pink-600 hover:underline text-sm">Editar</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Finished Listings Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Listagens Finalizadas</h2>
          {finishedListings.length === 0 ? (
            <p className="text-gray-500">Você não tem listagens finalizadas.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {finishedListings.map(listing => (
                <div key={listing.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition group relative opacity-60">
                  <h3 className="text-lg font-semibold text-pink-600 mb-1">{listing.title}</h3>
                  <p className="text-gray-700">Cidade: {listing.city}</p>
                  <p className="text-gray-500 text-sm">Criado em: {listing.createdAt}</p>
                  <span className="absolute top-2 right-2 bg-gray-300 text-gray-700 text-xs font-bold px-2 py-1 rounded">{listing.status}</span>
                  {listing.isPremium && <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">Premium</span>}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/anuncio/${listing.id}`} className="text-blue-600 hover:underline text-sm">Ver</Link>
                    <Link href={`/dashboard/escort/edit-listing/${listing.id}`} className="text-pink-600 hover:underline text-sm">Editar</Link>
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