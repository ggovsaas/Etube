'use client';

import { usePathname } from 'next/navigation';
import LocaleLink from '@/components/LocaleLink';
import { useLocale } from '@/hooks/useLocale';
import MobileMenu from '@/components/MobileMenu';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isDashboardRoute = pathname?.includes('/dashboard');
  const { t, locale } = useLocale();

  return (
    <>
      {!isAdminRoute && !isDashboardRoute && (
        <>
          {/* Navigation Bar */}
          <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <LocaleLink href="/" className="text-2xl font-bold text-red-600">
                    Portal<span className="text-gray-800">Escorts</span>
                  </LocaleLink>
                </div>
                
                {/* Navigation Links */}
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-6">
                    <LocaleLink href="/" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      {locale === 'es' ? 'Inicio' : 'Início'}
                    </LocaleLink>
                    <LocaleLink href={locale === 'es' ? '/perfiles' : '/perfis'} className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      {locale === 'es' ? 'Escorts' : 'Escorts'}
                    </LocaleLink>
                    <LocaleLink href="/webcam" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      {locale === 'es' ? 'WebCam' : 'WebCam'}
                    </LocaleLink>
                    <LocaleLink href="/login" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">{t.login}</LocaleLink>
                    <LocaleLink href="/criar-perfil" className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition">
                      {locale === 'es' ? 'Registrarse' : 'Registar'}
                    </LocaleLink>
                  </div>
                </div>
                
                {/* Mobile menu */}
                <MobileMenu />
              </div>
            </div>
          </nav>
        </>
      )}

      {children}

      {!isAdminRoute && !isDashboardRoute && (
        <>
          {/* Footer */}
          <footer className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Column */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {locale === 'es' ? 'Sobre Nosotros' : 'Sobre Nós'}
                </h3>
                <p className="text-gray-300 mb-4 text-sm">
                  {locale === 'es' 
                    ? 'La plataforma líder en Portugal para entretenimiento adulto, conectando personas de forma segura y discreta.'
                    : 'A plataforma líder em Portugal para entretenimento adulto, conectando pessoas de forma segura e discreta.'}
                </p>
                <ul className="space-y-2">
                  <li>
                    <LocaleLink href="/contactos" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Contacto / Soporte' : 'Contacto / Suporte'}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/carreiras" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Carreras' : 'Carreiras'}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/sitemap" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Mapa del Sitio (HTML)' : 'Mapa do Site (HTML)'}
                    </LocaleLink>
                  </li>
                </ul>
              </div>
              
              {/* Resources Column */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {locale === 'es' ? 'Recursos' : 'Recursos'}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <LocaleLink href={locale === 'es' ? '/blog' : '/blog'} className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Blog' : 'Blog'}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/pulse" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Pulse' : 'Pulse'}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/precos" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Precios' : 'Preços'}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/faq" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Preguntas Frecuentes' : 'Perguntas Frequentes'}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/sitemap" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Mapa del Sitio' : 'Mapa do Site'}
                    </LocaleLink>
                  </li>
                </ul>
              </div>
              
              {/* Legal & Support Column */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {locale === 'es' ? 'Legal y Soporte' : 'Legal e Suporte'}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <LocaleLink href="/privacidade" className="text-gray-300 hover:text-red-600 transition">
                      {t.privacy}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/termos" className="text-gray-300 hover:text-red-600 transition">
                      {t.terms}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/cookies" className="text-gray-300 hover:text-red-600 transition">
                      {t.cookies}
                    </LocaleLink>
                  </li>
                </ul>
              </div>
              
              {/* Connect Column */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {locale === 'es' ? 'Conectar' : 'Conectar'}
                </h3>
                <div className="flex space-x-4 mb-4">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-600 transition"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram text-xl"></i>
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-600 transition"
                    aria-label="Twitter"
                  >
                    <i className="fab fa-twitter text-xl"></i>
                  </a>
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-600 transition"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook-f text-xl"></i>
                  </a>
                  <a 
                    href="https://tiktok.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-600 transition"
                    aria-label="TikTok"
                  >
                    <i className="fab fa-tiktok text-xl"></i>
                  </a>
                </div>
                <div className="space-y-2">
                  <form className="flex flex-col space-y-2">
                    <input
                      type="email"
                      placeholder={locale === 'es' ? 'Tu email' : 'Seu email'}
                      className="bg-gray-800 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded transition"
                    >
                      {locale === 'es' ? 'Suscribirse' : 'Subscrever'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                <p className="text-gray-400 text-sm text-center md:text-left">
                  © {new Date().getFullYear()} acompanhantes.life. {locale === 'es' ? 'Todos los derechos reservados.' : 'Todos os direitos reservados.'}
                </p>
                <p className="text-gray-400 text-sm text-center md:text-right">
                  {locale === 'es' ? 'Contenido destinado exclusivamente a mayores de 18 años.' : 'Conteúdo destinado exclusivamente a maiores de 18 anos.'}
                </p>
              </div>
            </div>
          </div>
        </footer>
        </>
      )}
    </>
  );
}



