'use client';

export default function ContactosPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Contactos</h1>
      <p className="text-gray-700 mb-6">
        Entre em contacto com a equipa da acompanhantes.life para questões de suporte, pedidos de
        parceria ou assuntos legais.
      </p>
      <div className="space-y-2 text-gray-700">
        <p>Email geral: <a href="mailto:suporte@acompanhantes.life" className="text-red-600 underline">suporte@acompanhantes.life</a></p>
        <p>Assuntos legais: <a href="mailto:legal@acompanhantes.life" className="text-red-600 underline">legal@acompanhantes.life</a></p>
        <p>Publicidade/Media Kit: <a href="mailto:ads@acompanhantes.life" className="text-red-600 underline">ads@acompanhantes.life</a></p>
      </div>
    </main>
  );
}


