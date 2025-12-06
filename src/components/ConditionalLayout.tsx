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
                  <div className="ml-10 flex items-baseline space-x-4">
                    <LocaleLink href="/" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">{t.home}</LocaleLink>
                    <LocaleLink href={locale === 'es' ? '/perfiles' : '/perfis'} className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">{t.profiles}</LocaleLink>
                    <LocaleLink href="/criar-perfil" className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition">{t.createProfile}</LocaleLink>
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
        /* Footer */
        <footer className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo and description */}
              <div className="col-span-1 md:col-span-2">
                <div className="text-2xl font-bold text-red-600 mb-4">
                  acompanhantes<span className="text-white">.life</span>
                </div>
                <p className="text-gray-300 mb-4">
                  A plataforma líder em Portugal para entretenimento adulto, conectando pessoas de forma segura e discreta.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-red-600 transition">
                    <i className="fab fa-facebook-f text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-red-600 transition">
                    <i className="fab fa-twitter text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-red-600 transition">
                    <i className="fab fa-instagram text-xl"></i>
                  </a>
                </div>
              </div>
              
              {/* Legal Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.legal}</h3>
                <ul className="space-y-2">
                  <li><LocaleLink href="/termos" className="text-gray-300 hover:text-red-600 transition">{t.terms}</LocaleLink></li>
                  <li><LocaleLink href="/privacidade" className="text-gray-300 hover:text-red-600 transition">{t.privacy}</LocaleLink></li>
                  <li><LocaleLink href="/cookies" className="text-gray-300 hover:text-red-600 transition">{t.cookies}</LocaleLink></li>
                </ul>
              </div>
              
              {/* Support Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t.information}</h3>
                <ul className="space-y-2">
                  <li><LocaleLink href="/forum" className="text-gray-300 hover:text-red-600 transition">Fórum</LocaleLink></li>
                  <li><LocaleLink href="/webcam" className="text-gray-300 hover:text-red-600 transition">Webcam</LocaleLink></li>
                  <li><LocaleLink href="/parceiros" className="text-gray-300 hover:text-red-600 transition">{t.partners}</LocaleLink></li>
                  <li><LocaleLink href="/publicidade" className="text-gray-300 hover:text-red-600 transition">{t.advertising}</LocaleLink></li>
                  <li><LocaleLink href="/contactos" className="text-gray-300 hover:text-red-600 transition">{t.contacts}</LocaleLink></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                © {new Date().getFullYear()} acompanhantes.life. Todos os direitos reservados. | Conteúdo destinado exclusivamente a maiores de 18 anos.
              </p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}



