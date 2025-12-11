'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface EarningsSummary {
  currentBalance: number;
  lastPayoutDate: string | null;
  totalLifetimeEarnings: number;
  pendingPayouts: number;
}

interface Transaction {
  id: string;
  type: 'TIP' | 'GIFT' | 'CHAT' | 'CALL' | 'CONTEST_WINNING';
  amountCredits: number;
  amountCash: number;
  platformFee: number;
  clientId: string;
  createdAt: string;
  listingId: string | null;
}

interface PayoutRequest {
  id: string;
  amount: number;
  payoutMethod: string;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  requestedAt: string;
  processedAt: string | null;
  rejectionReason: string | null;
}

export default function EarningsPage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [cashOutAmount, setCashOutAmount] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer');
  const [payoutDetails, setPayoutDetails] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchEarnings();
    fetchTransactions();
    fetchPayoutRequests();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await fetch('/api/user/earnings');
      if (response.ok) {
        const data = await response.json();
        setEarnings(data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/user/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const response = await fetch('/api/user/payouts');
      if (response.ok) {
        const data = await response.json();
        setPayoutRequests(Array.isArray(data.payouts) ? data.payouts : []);
      }
    } catch (error) {
      console.error('Error fetching payout requests:', error);
    }
  };

  const handleCashOut = async () => {
    if (cashOutAmount <= 0 || !earnings || cashOutAmount > earnings.currentBalance) {
      alert(locale === 'pt' ? 'Valor inválido' : 'Valor inválido');
      return;
    }

    try {
      const response = await fetch('/api/user/payouts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cashOutAmount,
          payoutMethod,
          payoutDetails,
        }),
      });

      if (response.ok) {
        setShowCashOutModal(false);
        setCashOutAmount(0);
        setPayoutDetails('');
        await fetchEarnings();
        await fetchPayoutRequests();
      } else {
        alert(locale === 'pt' ? 'Erro ao solicitar saque' : 'Error al solicitar retiro');
      }
    } catch (error) {
      console.error('Error requesting cash out:', error);
      alert(locale === 'pt' ? 'Erro ao solicitar saque' : 'Error al solicitar retiro');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TIP: locale === 'pt' ? 'Gorjeta' : 'Propina',
      GIFT: locale === 'pt' ? 'Presente' : 'Regalo',
      CHAT: locale === 'pt' ? 'Chat Pago' : 'Chat Pagado',
      CALL: locale === 'pt' ? 'Chamada Paga' : 'Llamada Pagada',
      CONTEST_WINNING: locale === 'pt' ? 'Prêmio de Concurso' : 'Premio de Concurso',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      REQUESTED: locale === 'pt' ? 'Solicitado' : 'Solicitado',
      PROCESSING: locale === 'pt' ? 'Processando' : 'Procesando',
      COMPLETED: locale === 'pt' ? 'Completo' : 'Completado',
      REJECTED: locale === 'pt' ? 'Rejeitado' : 'Rechazado',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{locale === 'pt' ? 'Carregando...' : 'Cargando...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{locale === 'pt' ? 'Acesso Negado' : 'Acceso Denegado'}</h2>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'pt' ? 'Ganhos e Saques' : 'Ganancias y Retiros'}
        </h1>

        {/* Earnings Summary */}
        {earnings && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">{locale === 'pt' ? 'Saldo Atual' : 'Saldo Actual'}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings.currentBalance)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">{locale === 'pt' ? 'Último Saque' : 'Último Retiro'}</p>
              <p className="text-lg font-semibold text-gray-900">
                {earnings.lastPayoutDate
                  ? new Date(earnings.lastPayoutDate).toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'es-ES')
                  : locale === 'pt' ? 'Nunca' : 'Nunca'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">{locale === 'pt' ? 'Ganhos Totais' : 'Ganancias Totales'}</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(earnings.totalLifetimeEarnings)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">{locale === 'pt' ? 'Saques Pendentes' : 'Retiros Pendientes'}</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(earnings.pendingPayouts)}</p>
            </div>
          </div>
        )}

        {/* Cash Out Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCashOutModal(true)}
            disabled={!earnings || earnings.currentBalance <= 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition duration-200 shadow-lg"
          >
            {locale === 'pt' ? 'Solicitar Saque' : 'Solicitar Retiro'}
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {locale === 'pt' ? 'Histórico de Transações' : 'Historial de Transacciones'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Data' : 'Fecha'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Tipo' : 'Tipo'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Créditos' : 'Créditos'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Valor (€)' : 'Valor (€)'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Taxa' : 'Comisión'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTransactionTypeLabel(transaction.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.amountCredits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(transaction.amountCash)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(transaction.platformFee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>{locale === 'pt' ? 'Nenhuma transação ainda.' : 'Aún no hay transacciones.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {locale === 'pt' ? 'Histórico de Saques' : 'Historial de Retiros'}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Data' : 'Fecha'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Valor' : 'Valor'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Método' : 'Método'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Status' : 'Estado'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payoutRequests.map((payout) => (
                  <tr key={payout.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payout.requestedAt).toLocaleDateString(locale === 'pt' ? 'pt-PT' : 'es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payout.payoutMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payout.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : payout.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : payout.status === 'PROCESSING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {getStatusLabel(payout.status)}
                      </span>
                      {payout.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">{payout.rejectionReason}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payoutRequests.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>{locale === 'pt' ? 'Nenhum saque ainda.' : 'Aún no hay retiros.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cash Out Modal */}
        {showCashOutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'pt' ? 'Solicitar Saque' : 'Solicitar Retiro'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'pt' ? 'Valor Disponível' : 'Valor Disponible'}: {earnings && formatCurrency(earnings.currentBalance)}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={earnings?.currentBalance || 0}
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                    placeholder={locale === 'pt' ? 'Digite o valor' : 'Ingrese el valor'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'pt' ? 'Método de Pagamento' : 'Método de Pago'}
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                  >
                    <option value="Bank Transfer">{locale === 'pt' ? 'Transferência Bancária' : 'Transferencia Bancaria'}</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Crypto">{locale === 'pt' ? 'Criptomoeda' : 'Criptomoneda'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'pt' ? 'Detalhes do Pagamento' : 'Detalles del Pago'}
                  </label>
                  <textarea
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white"
                    placeholder={locale === 'pt' ? 'IBAN, PayPal email, ou endereço de carteira' : 'IBAN, email de PayPal, o dirección de cartera'}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleCashOut}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                  >
                    {locale === 'pt' ? 'Confirmar' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setShowCashOutModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition duration-200"
                  >
                    {locale === 'pt' ? 'Cancelar' : 'Cancelar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

