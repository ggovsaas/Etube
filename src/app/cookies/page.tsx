'use client';

export default function CookiesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Cookies</h1>
      <p className="text-gray-700 mb-6">
        A acompanhantes.life utiliza cookies para melhorar a experiência do utilizador, medir
        desempenho e manter a segurança. Pode gerir as suas preferências no seu navegador.
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Cookies essenciais: necessários ao funcionamento do site.</li>
        <li>Cookies analíticos: estatísticas anónimas de utilização.</li>
        <li>Cookies de preferência: guardam opções do utilizador.</li>
      </ul>
    </main>
  );
}


