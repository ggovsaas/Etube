import { locales, defaultLocale, getLocale, type Locale } from '@/middleware';

export const translations = {
  pt: {
    // Navigation
    home: 'Home',
    profiles: 'Perfis',
    createProfile: 'Criar Perfil',
    login: 'Login',
    // Homepage
    findPerfectCompanion: 'Encontre a Companhia Perfeita',
    findPerfectCompanionPart1: 'Encontre a',
    findPerfectCompanionPart2: 'Companhia Perfeita',
    activeProfiles: 'Perfis Ativos',
    cities: 'Cidades',
    available: 'Disponível',
    topEscorts: 'Top Acompanhantes',
    topEscortsDescription: 'Descubra os perfis mais populares e bem avaliados da nossa plataforma',
    varietyForAllTastes: 'Variedade para Todos os Gostos',
    varietyDescription: 'Explore diferentes categorias e encontre exatamente o que procura',
    loadingProfiles: 'Carregando perfis...',
    noProfilesFound: 'Nenhum perfil encontrado.',
    ageYears: 'anos',
    selectCity: 'Selecione a cidade',
    category: 'Categoria',
    search: 'Pesquisar',
    // Common
    age: 'Idade',
    city: 'Cidade',
    price: 'Preço',
    hour: 'hora',
    // Footer
    legal: 'Legal',
    terms: 'Termos & Condições',
    privacy: 'Política de Privacidade',
    cookies: 'Cookies',
    information: 'Informações',
    partners: 'Parceiros',
    advertising: 'Publicidade',
    contacts: 'Contactos',
    // Cities
    nationalCoverage: 'Cobertura Nacional',
    presentInMainCities: 'Presente nas principais cidades de Portugal',
    // Dashboard
    myAccount: 'Minha Conta',
    myListings: 'Minhas Listagens',
    pendingListings: 'Listagens Pendentes',
    activeListings: 'Listagens Ativas',
    createFreeAd: 'Criar Anúncio Grátis',
    awaitingApproval: 'Aguardando aprovação do administrador',
    edit: 'Editar',
    pending: 'Pendente',
    logout: 'Sair',
    name: 'Nome',
    email: 'Email',
    status: 'Status',
    active: 'Ativa',
    upgradeToPremium: 'Upgrade para Premium',
  },
  es: {
    // Navigation
    home: 'Inicio',
    profiles: 'Perfiles',
    createProfile: 'Crear Perfil',
    login: 'Iniciar Sesión',
    // Homepage
    findPerfectCompanion: 'Encuentra la Compañía Perfecta',
    findPerfectCompanionPart1: 'Encuentra la',
    findPerfectCompanionPart2: 'Compañía Perfecta',
    activeProfiles: 'Perfiles Activos',
    cities: 'Ciudades',
    available: 'Disponible',
    topEscorts: 'Top Acompañantes',
    topEscortsDescription: 'Descubre los perfiles más populares y mejor valorados de nuestra plataforma',
    varietyForAllTastes: 'Variedad para Todos los Gustos',
    varietyDescription: 'Explora diferentes categorías y encuentra exactamente lo que buscas',
    loadingProfiles: 'Cargando perfiles...',
    noProfilesFound: 'No se encontraron perfiles.',
    ageYears: 'años',
    selectCity: 'Selecciona la ciudad',
    category: 'Categoría',
    search: 'Buscar',
    // Common
    age: 'Edad',
    city: 'Ciudad',
    price: 'Precio',
    hour: 'hora',
    // Footer
    legal: 'Legal',
    terms: 'Términos y Condiciones',
    privacy: 'Política de Privacidad',
    cookies: 'Cookies',
    information: 'Información',
    partners: 'Socios',
    advertising: 'Publicidad',
    contacts: 'Contactos',
    // Cities
    nationalCoverage: 'Cobertura Nacional',
    presentInMainCities: 'Presente en las principales ciudades de España',
    // Dashboard
    myAccount: 'Mi Cuenta',
    myListings: 'Mis Anuncios',
    pendingListings: 'Anuncios Pendientes',
    activeListings: 'Anuncios Activos',
    createFreeAd: 'Crear Anuncio Gratis',
    awaitingApproval: 'Esperando aprobación del administrador',
    edit: 'Editar',
    pending: 'Pendiente',
    logout: 'Salir',
    name: 'Nombre',
    email: 'Email',
    status: 'Estado',
    active: 'Activa',
    upgradeToPremium: 'Actualizar a Premium',
  },
} as const;

// Cities data for each locale
export const citiesData = {
  pt: [
    { name: 'Lisboa', image: 'photo-1555881400-74d7acaacd8b' },
    { name: 'Porto', image: 'photo-1555881400-69d7acaacd9c' },
    { name: 'Coimbra', image: 'photo-1555881400-83d7acaacd7a' },
    { name: 'Braga', image: 'photo-1555881400-92d7acaacd6f' },
    { name: 'Aveiro', image: 'photo-1555881400-91d7acaacd7b' },
    { name: 'Faro', image: 'photo-1555881400-90d7acaacd7c' },
  ],
  es: [
    { name: 'Madrid', image: 'photo-1555881400-74d7acaacd8b' },
    { name: 'Barcelona', image: 'photo-1555881400-69d7acaacd9c' },
    { name: 'Valencia', image: 'photo-1555881400-83d7acaacd7a' },
    { name: 'Sevilla', image: 'photo-1555881400-92d7acaacd6f' },
    { name: 'Bilbao', image: 'photo-1555881400-91d7acaacd7b' },
    { name: 'Málaga', image: 'photo-1555881400-90d7acaacd7c' },
  ],
} as const;

export function getCities(locale: Locale) {
  return citiesData[locale] || citiesData[defaultLocale];
}

export function getTranslations(locale: Locale) {
  return translations[locale] || translations[defaultLocale];
}

export function getAlternateUrls(pathname: string, baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourwebsite.com') {
  const cleanPath = pathname.replace(/^\/(pt|es)/, '') || '/';
  const currentLocale = getLocale(pathname);
  
  const alternates = locales.map((locale) => ({
    locale,
    url: `${baseUrl}/${locale}${cleanPath === '/' ? '' : cleanPath}`,
  }));

  return {
    current: alternates.find((a) => a.locale === currentLocale)?.url || `${baseUrl}${cleanPath}`,
    alternates,
  };
}


