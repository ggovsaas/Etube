'use client';

import LocaleLink from '@/components/LocaleLink';
import { useLocale } from '@/hooks/useLocale';
import { useState } from 'react';

export default function MobileMenu() {
  const { t, locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-gray-700 hover:text-red-600 focus:outline-none"
      >
        <i className="fas fa-bars text-xl"></i>
      </button>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg py-2 w-56 z-50">
          <LocaleLink href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            {locale === 'es' ? 'Inicio' : 'Início'}
          </LocaleLink>
          <LocaleLink href={locale === 'es' ? '/perfiles' : '/perfis'} className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            {locale === 'es' ? 'Escorts' : 'Escorts'}
          </LocaleLink>
          <LocaleLink href="/webcam" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            {locale === 'es' ? 'WebCam' : 'WebCam'}
          </LocaleLink>
          <LocaleLink href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">{t.login}</LocaleLink>
          <LocaleLink href="/criar-perfil" className="block px-4 py-2 text-red-600 font-medium">
            {locale === 'es' ? 'Registrarse' : 'Registar'}
          </LocaleLink>
        </div>
      )}
    </div>
  );
} 