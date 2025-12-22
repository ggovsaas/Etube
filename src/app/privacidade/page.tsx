'use client';

export default function PrivacidadePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
      <p className="text-gray-700 mb-6">
        Na acompanhantes.life respeitamos a sua privacidade. Tratamos apenas dados necessários à
        operação do website (por exemplo, criação de conta, gestão de anúncios e faturação), de acordo
        com o RGPD. Não vendemos dados a terceiros.
      </p>
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">Dados Recolhidos</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
        <li>Dados de conta: email, nome de utilizador e palavra-passe (hash).</li>
        <li>Dados de perfil e anúncios submetidos voluntariamente.</li>
        <li>Dados técnicos (logs, IP) para segurança e prevenção de abuso.</li>
      </ul>
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">Direitos do Utilizador</h2>
      <p className="text-gray-700">
        Pode solicitar acesso, retificação ou eliminação dos seus dados através da página
        <a href="/contactos" className="text-red-600 underline"> Contactos</a>.
      </p>
    </main>
  );
}


