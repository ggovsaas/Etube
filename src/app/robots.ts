import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pt/',
          '/es/',
          '/pt/profis',
          '/es/perfiles',
          '/pt/blog',
          '/es/blog',
          '/pt/forum',
          '/es/forum',
          '/pt/webcam',
          '/es/webcam',
        ],
        disallow: [
          '/admin',
          '/dashboard',
          '/login',
          '/api',
          '/pt/dashboard',
          '/es/dashboard',
          '/pt/criar-anuncio',
          '/es/criar-anuncio',
        ],
      },
    ],
    sitemap: 'https://www.escorttube.vip/sitemap.xml',
  };
}

