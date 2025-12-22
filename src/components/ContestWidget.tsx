'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Users, Euro, Sparkles, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContestWidgetProps {
  contestId: string;
  locale?: string;
}

interface Contest {
  id: string;
  title: string;
  prizeDescription: string;
  totalSlots: number;
  slotPrice: number;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  slotsSold?: number;
  entriesCount?: number;
  creator?: {
    id: string;
    name: string | null;
  };
}

export default function ContestWidget({ contestId, locale = 'pt' }: ContestWidgetProps) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const translations = {
    pt: {
      enterRaffle: 'Participar na Rifa',
      slotsSold: 'Slots Vendidos',
      price: 'Preço',
      entering: 'Redirecionando...',
      error: 'Erro ao entrar na rifa',
      resolved: 'Concurso Resolvido',
      closed: 'Concurso Fechado',
      soldOut: 'Esgotado'
    },
    es: {
      enterRaffle: 'Participar en la Rifa',
      slotsSold: 'Slots Vendidos',
      price: 'Precio',
      entering: 'Redirigiendo...',
      error: 'Error al entrar en la rifa',
      resolved: 'Concurso Resuelto',
      closed: 'Concurso Cerrado',
      soldOut: 'Agotado'
    }
  };

  const t = translations[locale as 'pt' | 'es'] || translations.pt;

  useEffect(() => {
    fetchContest();
  }, [contestId]);

  const fetchContest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contests/${contestId}`);
      if (response.ok) {
        const data = await response.json();
        setContest(data.contest);
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = async () => {
    try {
      setEntering(true);
      setError(null);

      const response = await fetch(`/api/contests/${contestId}/enter`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.error);
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t.error);
      setEntering(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-center py-4">
          <Loader className="animate-spin text-yellow-600" size={24} />
        </div>
      </div>
    );
  }

  if (!contest) {
    return null;
  }

  const slotsSold = contest.slotsSold || contest.entriesCount || 0;
  const progress = (slotsSold / contest.totalSlots) * 100;
  const isSoldOut = slotsSold >= contest.totalSlots;
  const canEnter = contest.status === 'OPEN' && !isSoldOut;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <Trophy className="text-yellow-900" size={24} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{contest.title}</h3>
            {contest.status === 'RESOLVED' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {t.resolved}
              </span>
            )}
            {contest.status === 'CLOSED' && (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                {t.closed}
              </span>
            )}
            {isSoldOut && contest.status === 'OPEN' && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {t.soldOut}
              </span>
            )}
          </div>
          <p className="text-gray-700 mb-4">{contest.prizeDescription}</p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{t.slotsSold}: {slotsSold} / {contest.totalSlots}</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro size={16} />
                <span>{t.price}: {contest.slotPrice.toFixed(2)}€</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {progress.toFixed(1)}% completo
            </div>
          </div>

          {/* Enter Button */}
          {canEnter && (
            <button
              onClick={handleEnter}
              disabled={entering}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {entering ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>{t.entering}</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>{t.enterRaffle} ({contest.slotPrice.toFixed(2)}€)</span>
                </>
              )}
            </button>
          )}

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!canEnter && contest.status === 'OPEN' && isSoldOut && (
            <div className="text-center py-2 text-gray-600 text-sm">
              {t.soldOut}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

