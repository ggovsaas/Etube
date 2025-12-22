'use client';

import { useState } from 'react';
import { FaVideo, FaStop, FaCog, FaIdCard, FaCheck, FaTimes, FaUserPlus } from 'react-icons/fa';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface CoBroadcaster {
  id: string;
  name: string;
  status: VerificationStatus;
}

export default function BroadcasterDashboard() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [coBroadcasters, setCoBroadcasters] = useState<CoBroadcaster[]>([]);
  const [showAddCoBroadcaster, setShowAddCoBroadcaster] = useState(false);

  const handleStartStreaming = () => {
    if (verificationStatus !== 'approved') {
      alert('Sua conta precisa ser verificada antes de começar a transmitir.');
      return;
    }
    setIsStreaming(true);
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
  };

  const handleAddCoBroadcaster = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement co-broadcaster invitation logic
    setShowAddCoBroadcaster(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Painel do Transmissor</h1>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Streaming Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Controles de Transmissão
                </h3>
                <div className="mt-5">
                  {!isStreaming ? (
                    <button
                      onClick={handleStartStreaming}
                      disabled={verificationStatus !== 'approved'}
                      className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        verificationStatus === 'approved'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <FaVideo className="mr-2" />
                      Iniciar Transmissão
                    </button>
                  ) : (
                    <button
                      onClick={handleStopStreaming}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <FaStop className="mr-2" />
                      Parar Transmissão
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Status da Verificação
                </h3>
                <div className="mt-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {verificationStatus === 'approved' ? (
                        <FaCheck className="h-6 w-6 text-green-500" />
                      ) : verificationStatus === 'rejected' ? (
                        <FaTimes className="h-6 w-6 text-red-500" />
                      ) : (
                        <FaIdCard className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {verificationStatus === 'approved'
                          ? 'Conta Verificada'
                          : verificationStatus === 'rejected'
                          ? 'Verificação Rejeitada'
                          : 'Verificação Pendente'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {verificationStatus === 'approved'
                          ? 'Sua conta foi verificada e você pode começar a transmitir.'
                          : verificationStatus === 'rejected'
                          ? 'Sua verificação foi rejeitada. Por favor, entre em contato com o suporte.'
                          : 'Estamos verificando sua identidade. Este processo pode levar até 24 horas.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Co-Broadcasters */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Co-Transmissores
                  </h3>
                  <button
                    onClick={() => setShowAddCoBroadcaster(true)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    <FaUserPlus className="mr-2" />
                    Adicionar
                  </button>
                </div>
                <div className="mt-5">
                  {coBroadcasters.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhum co-transmissor adicionado.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {coBroadcasters.map((broadcaster) => (
                        <li key={broadcaster.id} className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {broadcaster.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Status: {broadcaster.status}
                              </p>
                            </div>
                            <button
                              className="text-sm text-red-600 hover:text-red-500"
                              onClick={() => {
                                // TODO: Implement remove co-broadcaster logic
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Configurações
                </h3>
                <div className="mt-5">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FaCog className="mr-2" />
                    Configurações da Transmissão
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Co-Broadcaster Modal */}
        {showAddCoBroadcaster && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Adicionar Co-Transmissor
              </h3>
              <form onSubmit={handleAddCoBroadcaster}>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCoBroadcaster(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Enviar Convite
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 