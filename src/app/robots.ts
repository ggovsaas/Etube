import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // TEMPORARILY BLOCK INDEXING until SEO is fully implemented
  // Set to false when ready to allow indexing
  const allowIndexing = false;
  
  if (!allowIndexing) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    };
  }
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pt/',
          '/es/',
          '/pt/perfis',
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


