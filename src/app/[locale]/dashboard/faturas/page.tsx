'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  description: string;
  type: 'PREMIUM' | 'FEATURE' | 'OTHER';
}

export default function FacturasPage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    fetchInvoices();
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

  const fetchInvoices = async () => {
    try {
      // TODO: Replace with actual API endpoint when available
      // For now, using mock data
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          date: '2024-01-15',
          amount: 29.99,
          status: 'PAID',
          description: locale === 'pt' ? 'Upgrade Premium - Mensal' : 'Upgrade Premium - Mensual',
          type: 'PREMIUM',
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          date: '2024-02-15',
          amount: 29.99,
          status: 'PAID',
          description: locale === 'pt' ? 'Upgrade Premium - Mensal' : 'Upgrade Premium - Mensual',
          type: 'PREMIUM',
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-003',
          date: '2024-03-15',
          amount: 29.99,
          status: 'PENDING',
          description: locale === 'pt' ? 'Upgrade Premium - Mensal' : 'Upgrade Premium - Mensual',
          type: 'PREMIUM',
        },
      ];
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement actual download functionality
    console.log('Downloading invoice:', invoiceId);
    alert(locale === 'pt' ? 'Download iniciado...' : 'Descarga iniciada...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    if (locale === 'pt') {
      switch (status) {
        case 'PAID':
          return 'Pago';
        case 'PENDING':
          return 'Pendente';
        case 'OVERDUE':
          return 'Vencido';
        default:
          return status;
      }
    } else {
      switch (status) {
        case 'PAID':
          return 'Pagado';
        case 'PENDING':
          return 'Pendiente';
        case 'OVERDUE':
          return 'Vencido';
        default:
          return status;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
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
          <p className="text-gray-600 mb-4">{locale === 'pt' ? 'Você precisa estar logado para acessar esta página.' : 'Necesitas estar conectado para acceder a esta página.'}</p>
          <Link href={`/${locale}/login`} className="text-indigo-600 hover:text-indigo-500">
            {locale === 'pt' ? 'Fazer Login' : 'Iniciar Sesión'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {locale === 'pt' ? 'Faturas' : 'Facturas'}
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
              {locale === 'pt' ? 'Total Pago' : 'Total Pagado'}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              €{invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
              {locale === 'pt' ? 'Pendente' : 'Pendiente'}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              €{invoices.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
              {locale === 'pt' ? 'Total de Faturas' : 'Total de Facturas'}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{invoices.length}</p>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {locale === 'pt' ? 'Histórico de Faturas' : 'Historial de Facturas'}
            </h2>
          </div>

          {invoices.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-sm sm:text-base text-gray-500">
                {locale === 'pt'
                  ? 'Nenhuma fatura encontrada.'
                  : 'No se encontraron facturas.'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                          {invoice.invoiceNumber}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1 break-words">{invoice.description}</p>
                      <p className="text-xs text-gray-500">
                        {locale === 'pt' ? 'Data:' : 'Fecha:'} {new Date(invoice.date).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'es-ES')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-lg sm:text-xl font-bold text-gray-900">€{invoice.amount.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>
                          {locale === 'pt' ? 'Baixar' : 'Descargar'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


