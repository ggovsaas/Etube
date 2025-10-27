"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedTurbo, setSelectedTurbo] = useState<string>('');
  const [selectedCredits, setSelectedCredits] = useState<string>('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProCheckout = async () => {
    if (!selectedPlan || !email) {
      setError('Por favor, selecione um plano e insira seu email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Erro ao iniciar pagamento.');
      }
    } catch (err) {
      setError('Erro ao conectar ao Stripe.');
    } finally {
      setLoading(false);
    }
  };

  const handleTurboCheckout = async () => {
    if (!selectedTurbo || !email) {
      setError('Por favor, selecione um tipo de TURBO e insira seu email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/turbo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedTurbo, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Erro ao iniciar pagamento.');
      }
    } catch (err) {
      setError('Erro ao conectar ao Stripe.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditsCheckout = async () => {
    if (!selectedCredits || !email) {
      setError('Por favor, selecione um pacote de créditos e insira seu email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: selectedCredits, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Erro ao iniciar pagamento.');
      }
    } catch (err) {
      setError('Erro ao conectar ao Stripe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Planos e Preços</h1>
          <p className="text-xl text-gray-600">Escolha o plano perfeito para o seu negócio</p>
        </div>

        {/* Email Input */}
        <div className="mb-8 flex flex-col items-center">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-gray-900 mb-2"
            disabled={loading}
          />
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        </div>

        {/* Free Tier */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Plano Gratuito</h2>
            <p className="text-gray-600 mb-6">Perfeito para começar</p>
            <div className="text-4xl font-bold text-green-600 mb-6">Grátis</div>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Até 3 anúncios ativos
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Expiração de 7 dias (renovação manual)
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Fotos e descrições básicas
              </li>
              <li className="flex items-center">
                <span className="text-red-500 mr-2">✗</span>
                Sem auto-renovação
              </li>
              <li className="flex items-center">
                <span className="text-red-500 mr-2">✗</span>
                Sem estatísticas
              </li>
            </ul>
              </div>
              </div>

        {/* TURBO Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* TURBO */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-purple-600 mb-2">TURBO</h3>
              <p className="text-gray-600 mb-4">Boost para o topo dos resultados</p>
              <div className="text-3xl font-bold text-purple-600 mb-4">8€</div>
              <p className="text-sm text-gray-500 mb-4">(vs 10€ da concorrência - 20% desconto)</p>
              </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span>
                5x mais contatos garantidos
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span>
                Topo dos resultados de busca
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span>
                Duração de 1-7 dias
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span>
                Expiração de 7 dias
              </li>
            </ul>
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Duração:</label>
              <select
                value={selectedTurbo}
                onChange={(e) => setSelectedTurbo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione a duração</option>
                <option value="turbo_1_day">1 dia - 8€</option>
                <option value="turbo_3_days">3 dias - 20€</option>
                <option value="turbo_7_days">7 dias - 40€</option>
              </select>
            </div>
            <button
              onClick={handleTurboCheckout}
              disabled={loading || !selectedTurbo}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : 'Comprar TURBO'}
            </button>
          </div>

          {/* SUPER TURBO */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-purple-600 mb-2">SUPER TURBO</h3>
              <p className="text-gray-600 mb-4">Máxima visibilidade</p>
              <div className="text-3xl font-bold text-purple-600 mb-4">15€</div>
              <p className="text-sm text-gray-500 mb-4">(vs 18€ da concorrência - 17% desconto)</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span>
                20x mais contatos garantidos
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span>
                Prioridade máxima nos resultados
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span>
                Seleção de horários
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">✓</span>
                Duração de 1-7 dias
              </li>
            </ul>
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700">Duração:</label>
              <select
                value={selectedTurbo}
                onChange={(e) => setSelectedTurbo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione a duração</option>
                <option value="superturbo_1_day">1 dia - 15€</option>
                <option value="superturbo_3_days">3 dias - 35€</option>
                <option value="superturbo_7_days">7 dias - 70€</option>
              </select>
            </div>
            <button
              onClick={handleTurboCheckout}
              disabled={loading || !selectedTurbo}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : 'Comprar SUPER TURBO'}
            </button>
          </div>
        </div>

        {/* PRO Membership */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">PRO Membership</h2>
            <p className="text-purple-100 mb-6">O plano completo para profissionais</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">1 Mês</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">12€</div>
              <p className="text-sm text-gray-500 mb-4">(vs 13.2€ da concorrência)</p>
              <button
                onClick={() => setSelectedPlan('pro_1_month')}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedPlan === 'pro_1_month' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Selecionar
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">3 Meses</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">24€</div>
              <p className="text-sm text-gray-500 mb-4">(vs 26.4€ da concorrência)</p>
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mb-2">
                33% Desconto
              </div>
              <button
                onClick={() => setSelectedPlan('pro_3_months')}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedPlan === 'pro_3_months' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Selecionar
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">6 Meses</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">36€</div>
              <p className="text-sm text-gray-500 mb-4">(vs 39.6€ da concorrência)</p>
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mb-2">
                50% Desconto
              </div>
              <button
                onClick={() => setSelectedPlan('pro_6_months')}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedPlan === 'pro_6_months' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Selecionar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="text-white">
              <h3 className="text-xl font-bold mb-4">Benefícios PRO:</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Anúncios ilimitados
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Auto-renovação (sem expiração)
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Selo PRO (mais visibilidade)
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Estatísticas de visitas
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Duplicar anúncios
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Suporte dedicado
                </li>
              </ul>
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold mb-4">Vantagens:</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Prioridade nos resultados
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Sistema de créditos
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Calendário de escalada
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Enviar créditos para outros
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Descontos em créditos
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Sem limitações
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleProCheckout}
              disabled={loading || !selectedPlan}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : 'Ativar PRO'}
            </button>
          </div>
        </div>

        {/* Credit System */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Créditos</h2>
            <p className="text-gray-600">Compre créditos para usar em TURBO e outras funcionalidades</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">10 Créditos</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">8€</div>
              <p className="text-sm text-gray-500 mb-4">(vs 10€ da concorrência)</p>
              <button
                onClick={() => setSelectedCredits('credits_10')}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedCredits === 'credits_10' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Selecionar
              </button>
            </div>

            <div className="border rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">25 Créditos</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">18€</div>
              <p className="text-sm text-gray-500 mb-4">(vs 22€ da concorrência)</p>
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mb-2">
                Mais Popular
              </div>
              <button
                onClick={() => setSelectedCredits('credits_25')}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedCredits === 'credits_25' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Selecionar
              </button>
            </div>

            <div className="border rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">50 Créditos</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">32€</div>
              <p className="text-sm text-gray-500 mb-4">(vs 40€ da concorrência)</p>
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mb-2">
                Melhor Valor
              </div>
              <button
                onClick={() => setSelectedCredits('credits_50')}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedCredits === 'credits_50' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Selecionar
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleCreditsCheckout}
              disabled={loading || !selectedCredits}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : 'Comprar Créditos'}
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Métodos de Pagamento</h2>
            <p className="text-gray-600">Pagamentos seguros e rápidos</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-2xl">💳</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Cartões</h3>
              <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">MB WAY</h3>
              <p className="text-sm text-gray-600">Pagamento móvel português</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-2xl">🏦</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Multibanco</h3>
              <p className="text-sm text-gray-600">Transferência bancária</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Todos os pagamentos são processados de forma segura pela Stripe
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-purple-600 hover:underline">Voltar à página inicial</Link>
        </div>
      </div>
    </div>
  );
} 