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
                    <LocaleLink href="/feed" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      {locale === 'es' ? 'Feed' : 'Feed'}
                    </LocaleLink>
                    <LocaleLink href={locale === 'es' ? '/perfiles' : '/perfis'} className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      {locale === 'es' ? 'Perfiles' : 'Perfis'}
                    </LocaleLink>
                    <LocaleLink href={locale === 'es' ? '/articulos' : '/artigos'} className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      {locale === 'es' ? 'Artículos' : 'Artigos'}
                    </LocaleLink>
                    <LocaleLink href="/webcam" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      {locale === 'es' ? 'Webcam' : 'Webcam'}
                    </LocaleLink>
                    <LocaleLink href="/precos" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">
                      {locale === 'es' ? 'Créditos' : 'Créditos'}
                    </LocaleLink>
                    <LocaleLink href="/login" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">{t.login}</LocaleLink>
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
        {/* Footer */}
        <footer className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Column */}
              <div>
                <div className="text-2xl font-bold text-red-600 mb-4">
                  acompanhantes<span className="text-white">.life</span>
                </div>
                <p className="text-gray-300 mb-4 text-sm">
                  {locale === 'es' 
                    ? 'La plataforma líder en Portugal para entretenimiento adulto, conectando personas de forma segura y discreta.'
                    : 'A plataforma líder em Portugal para entretenimento adulto, conectando pessoas de forma segura e discreta.'}
                </p>
                <div className="flex space-x-4">
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
              </div>
              
              {/* Resources Column */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {locale === 'es' ? 'Recursos' : 'Recursos'}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <LocaleLink href={locale === 'es' ? '/articulos' : '/artigos'} className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Artículos' : 'Artigos'}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/feed" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Feed' : 'Feed'}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/forum" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Foro' : 'Fórum'}
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
                <h3 className="text-lg font-semibold mb-4">{t.legal}</h3>
                <ul className="space-y-2">
                  <li>
                    <LocaleLink href="/termos" className="text-gray-300 hover:text-red-600 transition">
                      {t.terms}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/privacidade" className="text-gray-300 hover:text-red-600 transition">
                      {t.privacy}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/cookies" className="text-gray-300 hover:text-red-600 transition">
                      {t.cookies}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/contactos" className="text-gray-300 hover:text-red-600 transition">
                      {t.contacts}
                    </LocaleLink>
                  </li>
                </ul>
              </div>
              
              {/* Connect Column */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {locale === 'es' ? 'Conectar' : 'Conectar'}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <LocaleLink href="/webcam" className="text-gray-300 hover:text-red-600 transition">
                      {locale === 'es' ? 'Webcam' : 'Webcam'}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/parceiros" className="text-gray-300 hover:text-red-600 transition">
                      {t.partners}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/publicidade" className="text-gray-300 hover:text-red-600 transition">
                      {t.advertising}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href="/criar-perfil" className="text-gray-300 hover:text-red-600 transition">
                      {t.createProfile}
                    </LocaleLink>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} acompanhantes.life. {locale === 'es' ? 'Todos los derechos reservados.' : 'Todos os direitos reservados.'} | {locale === 'es' ? 'Contenido destinado exclusivamente a mayores de 18 años.' : 'Conteúdo destinado exclusivamente a maiores de 18 anos.'}
              </p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}



