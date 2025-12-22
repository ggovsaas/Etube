'use client';

export default function TermosPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Termos & Condições</h1>
      <p className="text-gray-700 mb-4">Última atualização: {new Date().getFullYear()}</p>
      <p className="text-gray-700 mb-6">
        O website acompanhantes.life atua como plataforma de anúncios e diretório. Não somos agência,
        não intermediamos contactos nem prestamos serviços anunciados. Todo o conteúdo publicado é da
        responsabilidade de quem o submete, devendo cumprir a lei portuguesa e as nossas políticas.
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Conteúdo destinado exclusivamente a maiores de 18 anos.</li>
        <li>É proibido publicar material ilegal, ofensivo ou que infrinja direitos de terceiros.</li>
        <li>Reservamo-nos o direito de remover anúncios que violem os termos, sem aviso prévio.</li>
        <li>Os pagamentos referentes a destaques/publicidade são para visibilidade no site.</li>
        <li>Ao utilizar o site, aceita estes termos na íntegra.</li>
      </ul>
    </main>
  );
}


