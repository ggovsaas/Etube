'use client';

import { useLocale } from '@/hooks/useLocale';
import Link from 'next/link';
import Image from 'next/image';

// Network countries with their locales and flags
const networkCountries = [
  { name: 'Portugal', locale: 'pt', flag: '🇵🇹', cities: ['Lisboa', 'Porto', 'Coimbra', 'Braga', 'Aveiro', 'Faro'] },
  { name: 'Spain', locale: 'es', flag: '🇪🇸', cities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Marbella'] },
  { name: 'United Kingdom', locale: 'en-GB', flag: '🇬🇧', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool'] },
  { name: 'United States', locale: 'en-US', flag: '🇺🇸', cities: ['New York', 'Los Angeles', 'Miami', 'Las Vegas'] },
  { name: 'Germany', locale: 'de', flag: '🇩🇪', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'] },
  { name: 'Netherlands', locale: 'nl', flag: '🇳🇱', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'] },
  { name: 'France', locale: 'fr', flag: '🇫🇷', cities: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse'] },
  { name: 'Italy', locale: 'it', flag: '🇮🇹', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'] },
  { name: 'Greece', locale: 'el', flag: '🇬🇷', cities: ['Athens', 'Thessaloniki', 'Mykonos', 'Santorini'] },
  { name: 'Cyprus', locale: 'en-CY', flag: '🇨🇾', cities: ['Limassol', 'Nicosia', 'Paphos', 'Larnaca', 'Ayia Napa'] },
  { name: 'Poland', locale: 'pl', flag: '🇵🇱', cities: ['Warsaw', 'Krakow', 'Gdansk', 'Wroclaw'] },
  { name: 'Croatia', locale: 'hr', flag: '🇭🇷', cities: ['Zagreb', 'Split', 'Dubrovnik', 'Rijeka'] },
  { name: 'Brazil', locale: 'pt-BR', flag: '🇧🇷', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'] },
  { name: 'Mexico', locale: 'es-MX', flag: '🇲🇽', cities: ['Mexico City', 'Guadalajara', 'Cancún', 'Tijuana'] },
  { name: 'Colombia', locale: 'es-CO', flag: '🇨🇴', cities: ['Bogotá', 'Medellín', 'Cali', 'Cartagena'] },
  { name: 'Chile', locale: 'es-CL', flag: '🇨🇱', cities: ['Santiago', 'Valparaíso', 'Concepción'] },
  { name: 'Uruguay', locale: 'es-UY', flag: '🇺🇾', cities: ['Montevideo', 'Punta del Este'] },
  { name: 'Belgium', locale: 'nl-BE', flag: '🇧🇪', cities: ['Brussels', 'Antwerp', 'Ghent'] },
  { name: 'South Africa', locale: 'en-ZA', flag: '🇿🇦', cities: ['Cape Town', 'Johannesburg', 'Durban'] },
  { name: 'Angola', locale: 'pt-AO', flag: '🇦🇴', cities: ['Luanda', 'Benguela', 'Lubango'] },
];

export default function NetworkPage() {
  const { locale, t } = useLocale();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {locale === 'es' ? 'Nuestra Red Global' : locale === 'en' || locale.startsWith('en') ? 'Our Global Network' : 'A Nossa Rede Global'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'es' 
              ? 'Explora nuestra red de plataformas en diferentes países. Haz clic en un país para ver perfiles en ese mercado.'
              : locale === 'en' || locale.startsWith('en')
              ? 'Explore our network of platforms in different countries. Click on a country to view profiles in that market.'
              : 'Explore a nossa rede de plataformas em diferentes países. Clique num país para ver perfis nesse mercado.'}
          </p>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {networkCountries.map((country) => {
            const profilesRoute = country.locale === 'es' ? '/perfiles' : '/perfis';
            const isCurrentCountry = country.locale === locale || 
              (locale.startsWith('en') && country.locale.startsWith('en')) ||
              (locale.startsWith('pt') && country.locale.startsWith('pt')) ||
              (locale.startsWith('es') && country.locale.startsWith('es'));

            return (
              <Link
                key={country.locale}
                href={`/${country.locale}${profilesRoute}`}
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  isCurrentCountry ? 'ring-2 ring-red-600 border-2 border-red-600' : ''
                }`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-4xl">{country.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{country.name}</h3>
                    {isCurrentCountry && (
                      <span className="text-xs text-red-600 font-semibold">
                        {locale === 'es' ? 'Actual' : locale === 'en' || locale.startsWith('en') ? 'Current' : 'Atual'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {locale === 'es' ? 'Ciudades:' : locale === 'en' || locale.startsWith('en') ? 'Cities:' : 'Cidades:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {country.cities.slice(0, 3).map((city, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {city}
                      </span>
                    ))}
                    {country.cities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{country.cities.length - 3} {locale === 'es' ? 'más' : locale === 'en' || locale.startsWith('en') ? 'more' : 'mais'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-red-600 font-semibold hover:text-red-700">
                    {locale === 'es' ? 'Ver perfiles →' : locale === 'en' || locale.startsWith('en') ? 'View profiles →' : 'Ver perfis →'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {locale === 'es' ? '¿Cómo funciona?' : locale === 'en' || locale.startsWith('en') ? 'How it works?' : 'Como funciona?'}
              </h3>
              <p className="text-blue-800 text-sm">
                {locale === 'es'
                  ? 'Al hacer clic en un país, serás redirigido a la versión de ese país con perfiles locales. Puedes cambiar de país en cualquier momento desde esta página.'
                  : locale === 'en' || locale.startsWith('en')
                  ? 'When you click on a country, you\'ll be redirected to that country\'s version with local profiles. You can switch countries anytime from this page.'
                  : 'Ao clicar num país, será redirecionado para a versão desse país com perfis locais. Pode mudar de país a qualquer momento a partir desta página.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


