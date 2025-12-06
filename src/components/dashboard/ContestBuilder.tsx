'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Plus, X, CheckCircle, Clock, Users, Euro, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Contest {
  id: string;
  title: string;
  prizeDescription: string;
  totalSlots: number;
  slotPrice: number;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  createdAt: Date;
  entriesCount?: number;
  slotsSold?: number;
  winnerId?: string | null;
}

interface ContestBuilderProps {
  userId: string;
  locale?: 'pt' | 'es';
}

export default function ContestBuilder({ userId, locale = 'pt' }: ContestBuilderProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    prizeDescription: '',
    totalSlots: '50',
    slotPrice: '2.00',
    threadId: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const translations = {
    pt: {
      title: 'Concurso/Rifa',
      subtitle: 'Crie rifas para gerar receita e engajamento',
      createContest: 'Criar Concurso',
      newContest: 'Novo Concurso',
      titleLabel: 'Título do Concurso',
      prizeLabel: 'Descrição do Prêmio',
      slotsLabel: 'Total de Slots',
      priceLabel: 'Preço por Slot (€)',
      threadIdLabel: 'ID do Tópico do Fórum (opcional)',
      submit: 'Criar Concurso',
      cancel: 'Cancelar',
      creating: 'Criando...',
      contests: 'Meus Concursos',
      status: 'Status',
      slotsSold: 'Slots Vendidos',
      totalRevenue: 'Receita Total',
      resolve: 'Sortear Vencedor',
      resolving: 'Sorteando...',
      resolved: 'Resolvido',
      open: 'Aberto',
      closed: 'Fechado',
      noContests: 'Nenhum concurso criado ainda',
      required: 'Obrigatório'
    },
    es: {
      title: 'Concurso/Rifa',
      subtitle: 'Crea rifas para generar ingresos y participación',
      createContest: 'Crear Concurso',
      newContest: 'Nuevo Concurso',
      titleLabel: 'Título del Concurso',
      prizeLabel: 'Descripción del Premio',
      slotsLabel: 'Total de Slots',
      priceLabel: 'Precio por Slot (€)',
      threadIdLabel: 'ID del Tema del Foro (opcional)',
      submit: 'Crear Concurso',
      cancel: 'Cancelar',
      creating: 'Creando...',
      contests: 'Mis Concursos',
      status: 'Estado',
      slotsSold: 'Slots Vendidos',
      totalRevenue: 'Ingresos Totales',
      resolve: 'Seleccionar Ganador',
      resolving: 'Seleccionando...',
      resolved: 'Resuelto',
      open: 'Abierto',
      closed: 'Cerrado',
      noContests: 'Aún no se han creado concursos',
      required: 'Obligatorio'
    }
  };

  const t = translations[locale];

  useEffect(() => {
    fetchContests();
  }, [userId]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contests/creator/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setContests(data.contests || []);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          prizeDescription: formData.prizeDescription.trim(),
          totalSlots: parseInt(formData.totalSlots),
          slotPrice: parseFloat(formData.slotPrice),
          threadId: formData.threadId.trim() || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create contest');
      }

      setSuccess(locale === 'es' ? 'Concurso creado con éxito' : 'Concurso criado com sucesso');
      setFormData({
        title: '',
        prizeDescription: '',
        totalSlots: '50',
        slotPrice: '2.00',
        threadId: ''
      });
      setShowForm(false);
      fetchContests();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleResolve = async (contestId: string) => {
    if (!confirm(locale === 'es' ? '¿Está seguro de que desea sortear el ganador? Esta acción no se puede deshacer.' : 'Tem certeza que deseja sortear o vencedor? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setResolving(contestId);
      const response = await fetch(`/api/contests/${contestId}/resolve`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve contest');
      }

      setSuccess(locale === 'es' ? 'Ganador seleccionado' : 'Vencedor selecionado');
      fetchContests();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setResolving(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'RESOLVED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return t.open;
      case 'CLOSED':
        return t.closed;
      case 'RESOLVED':
        return t.resolved;
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy size={24} className="text-yellow-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Plus size={18} />
            {t.createContest}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t.newContest}</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({
                  title: '',
                  prizeDescription: '',
                  totalSlots: '50',
                  slotPrice: '2.00',
                  threadId: ''
                });
                setError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.titleLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t.titleLabel}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.prizeLabel} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={formData.prizeDescription}
                onChange={(e) => setFormData({ ...formData, prizeDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t.prizeLabel}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.slotsLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={formData.totalSlots}
                  onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.priceLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  max="1000"
                  step="0.01"
                  value={formData.slotPrice}
                  onChange={(e) => setFormData({ ...formData, slotPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.threadIdLabel}
              </label>
              <input
                type="text"
                value={formData.threadId}
                onChange={(e) => setFormData({ ...formData, threadId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="ID do tópico (opcional)"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    title: '',
                    prizeDescription: '',
                    totalSlots: '50',
                    slotPrice: '2.00',
                    threadId: ''
                  });
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                {t.submit}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contests List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.contests}</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : contests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
            <p>{t.noContests}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contests.map((contest) => {
              const slotsSold = contest.slotsSold || contest.entriesCount || 0;
              const totalRevenue = slotsSold * contest.slotPrice;
              const progress = (slotsSold / contest.totalSlots) * 100;

              return (
                <div key={contest.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{contest.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{contest.prizeDescription}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                          {getStatusText(contest.status)}
                        </span>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users size={16} />
                          <span>{slotsSold} / {contest.totalSlots}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Euro size={16} />
                          <span>{totalRevenue.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {slotsSold} de {contest.totalSlots} slots vendidos ({progress.toFixed(1)}%)
                    </div>
                  </div>

                  {/* Actions */}
                  {contest.status === 'OPEN' && slotsSold > 0 && (
                    <button
                      onClick={() => handleResolve(contest.id)}
                      disabled={resolving === contest.id}
                      className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Sparkles size={18} />
                      {resolving === contest.id ? t.resolving : t.resolve}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

