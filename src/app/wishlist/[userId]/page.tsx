'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Gift, ArrowLeft, ShoppingCart } from 'lucide-react';

interface WishlistItem {
  id: string;
  productName: string;
  productUrl: string;
  price: number | null;
  isFulfilled: boolean;
  wooProductId?: string;
  wooDetails?: {
    currentPrice: number;
    regularPrice: number;
    salePrice: number | null;
    stockStatus: 'instock' | 'outofstock' | 'onbackorder';
    inStock: boolean;
    purchasable: boolean;
  };
}

export default function WishlistPage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string>('');

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/wishlist/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch wishlist: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
          return;
        }
        
        setWishlistItems(data.items || []);
        
        // Fetch creator name if available
        if (data.creatorName) {
          setCreatorName(data.creatorName);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  const getCartUrl = (item: WishlistItem): string => {
    // If we have a WooCommerce product ID, use the product URL directly
    // WooCommerce will handle add-to-cart via the product page
    return item.productUrl;
  };

  const getPriceDisplay = (item: WishlistItem): string => {
    if (item.wooDetails) {
      const price = item.wooDetails.salePrice || item.wooDetails.currentPrice;
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    }
    if (item.price) {
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
      }).format(item.price);
    }
    return 'Preço sob consulta';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando lista de desejos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-red-600 hover:underline">
            Voltar à página inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <Gift size={24} className="text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Lista de Desejos
                </h1>
                {creatorName && (
                  <p className="text-sm text-gray-500">de {creatorName}</p>
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
            <p className="text-gray-600 text-lg mb-2">Lista de desejos vazia</p>
            <p className="text-gray-400 text-sm">
              Esta lista ainda não possui itens.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'itens'} na lista
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => {
                const isOutOfStock = item.wooDetails && !item.wooDetails.inStock;
                const cartUrl = getCartUrl(item);
                
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
                                {new Intl.NumberFormat('pt-PT', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }).format(item.wooDetails.salePrice)}
                              </span>
                              <span className="text-sm text-gray-400 line-through ml-2">
                                {new Intl.NumberFormat('pt-PT', {
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
                            {item.wooDetails.inStock ? 'Em stock' : 'Esgotado'}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {item.wooDetails?.purchasable && item.wooDetails.inStock ? (
                          <a
                            href={cartUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            <ShoppingCart size={18} />
                            Adicionar ao Carrinho
                          </a>
                        ) : (
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors"
                          >
                            Ver Produto
                          </a>
                        )}
                        
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 text-gray-600 hover:text-red-600 text-sm transition-colors"
                        >
                          Ver detalhes →
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

