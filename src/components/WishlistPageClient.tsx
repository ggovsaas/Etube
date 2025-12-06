'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, ArrowLeft, ShoppingCart } from 'lucide-react';
import { WishlistItem } from '@/lib/data/wishlists';

interface WishlistPageClientProps {
  wishlistItems: WishlistItem[];
  creatorName: string | null;
  locale: 'pt' | 'es';
}

export default function WishlistPageClient({
  wishlistItems,
  creatorName,
  locale = 'pt'
}: WishlistPageClientProps) {
  const getPriceDisplay = (item: WishlistItem): string => {
    if (item.wooDetails) {
      const price = item.wooDetails.salePrice || item.wooDetails.currentPrice;
      return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'pt-PT', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    }
    if (item.price) {
      return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'pt-PT', {
        style: 'currency',
        currency: 'EUR'
      }).format(item.price);
    }
    return locale === 'es' ? 'Precio bajo consulta' : 'Preço sob consulta';
  };

  const translations = {
    pt: {
      title: 'Lista de Desejos',
      emptyTitle: 'Lista de desejos vazia',
      emptyMessage: 'Esta lista ainda não possui itens.',
      itemsCount: (count: number) => `${count} ${count === 1 ? 'item' : 'itens'} na lista`,
      inStock: 'Em stock',
      outOfStock: 'Esgotado',
      addToCart: 'Adicionar ao Carrinho',
      viewProduct: 'Ver Produto',
      viewDetails: 'Ver detalhes',
      back: 'Voltar à página inicial'
    },
    es: {
      title: 'Lista de Deseos',
      emptyTitle: 'Lista de deseos vacía',
      emptyMessage: 'Esta lista aún no tiene artículos.',
      itemsCount: (count: number) => `${count} ${count === 1 ? 'artículo' : 'artículos'} en la lista`,
      inStock: 'En stock',
      outOfStock: 'Agotado',
      addToCart: 'Añadir al Carrito',
      viewProduct: 'Ver Producto',
      viewDetails: 'Ver detalles',
      back: 'Volver a la página principal'
    }
  };

  const t = translations[locale];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <Gift size={24} className="text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t.title}
                </h1>
                {creatorName && (
                  <p className="text-sm text-gray-500">
                    {locale === 'es' ? 'de' : 'de'} {creatorName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Gift size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">{t.emptyTitle}</p>
            <p className="text-gray-400 text-sm">
              {t.emptyMessage}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {t.itemsCount(wishlistItems.length)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => {
                const isOutOfStock = item.wooDetails && !item.wooDetails.inStock;
                
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
                      isOutOfStock ? 'opacity-60 border-gray-200' : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    {/* Product Image Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                      <Gift size={48} className="text-red-200" />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {item.productName}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          {item.wooDetails?.salePrice ? (
                            <div>
                              <span className="text-lg font-bold text-red-600">
                                {new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'pt-PT', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }).format(item.wooDetails.salePrice)}
                              </span>
                              <span className="text-sm text-gray-400 line-through ml-2">
                                {new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'pt-PT', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }).format(item.wooDetails.regularPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {getPriceDisplay(item)}
                            </span>
                          )}
                        </div>
                        
                        {item.wooDetails && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.wooDetails.inStock
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.wooDetails.inStock ? t.inStock : t.outOfStock}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {item.wooDetails?.purchasable && item.wooDetails.inStock ? (
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            <ShoppingCart size={18} />
                            {t.addToCart}
                          </a>
                        ) : (
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors"
                          >
                            {t.viewProduct}
                          </a>
                        )}
                        
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 text-gray-600 hover:text-red-600 text-sm transition-colors"
                        >
                          {t.viewDetails} →
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


