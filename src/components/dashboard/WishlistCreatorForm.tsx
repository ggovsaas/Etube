'use client';

import React, { useState } from 'react';
import { Gift, Plus, X } from 'lucide-react';

interface WishlistItem {
  id: string;
  productName: string;
  productUrl: string;
  price: number | null;
  isFulfilled: boolean;
}

interface WishlistCreatorFormProps {
  userId: string;
  locale?: 'pt' | 'es';
}

export default function WishlistCreatorForm({ userId, locale = 'pt' }: WishlistCreatorFormProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    productUrl: '',
    price: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch existing items on mount
  React.useEffect(() => {
    fetchItems();
  }, [userId]);

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/wishlist/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/wishlist/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productName: formData.productName.trim(),
          productUrl: formData.productUrl.trim(),
          price: formData.price ? parseFloat(formData.price) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item');
      }

      setSuccess(locale === 'es' ? 'Artículo añadido con éxito' : 'Item adicionado com sucesso');
      setFormData({ productName: '', productUrl: '', price: '' });
      fetchItems(); // Refresh list
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm(locale === 'es' ? '¿Eliminar este artículo?' : 'Eliminar este item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/wishlist/item/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete item');
      }

      setSuccess(locale === 'es' ? 'Artículo eliminado' : 'Item eliminado');
      fetchItems(); // Refresh list
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete item');
    }
  };

  const translations = {
    pt: {
      title: 'Lista de Desejos',
      subtitle: 'Adicione produtos da sua loja WooCommerce',
      productName: 'Nome do Produto',
      productUrl: 'URL do Produto (WooCommerce)',
      productUrlPlaceholder: 'https://sua-loja.com/produto/123 ou apenas o ID do produto',
      price: 'Preço (opcional)',
      pricePlaceholder: 'Deixe vazio para usar preço do WooCommerce',
      addButton: 'Adicionar Item',
      empty: 'Nenhum item na lista',
      delete: 'Eliminar',
      required: 'Obrigatório'
    },
    es: {
      title: 'Lista de Deseos',
      subtitle: 'Añade productos de tu tienda WooCommerce',
      productName: 'Nombre del Producto',
      productUrl: 'URL del Producto (WooCommerce)',
      productUrlPlaceholder: 'https://tu-tienda.com/producto/123 o solo el ID del producto',
      price: 'Precio (opcional)',
      pricePlaceholder: 'Dejar vacío para usar precio de WooCommerce',
      addButton: 'Añadir Artículo',
      empty: 'No hay artículos en la lista',
      delete: 'Eliminar',
      required: 'Obligatorio'
    }
  };

  const t = translations[locale];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Gift size={24} className="text-red-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
            {t.productName} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="productName"
            required
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Ex: Perfume Chanel No. 5"
          />
        </div>

        <div>
          <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-1">
            {t.productUrl} <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="productUrl"
            required
            value={formData.productUrl}
            onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder={t.productUrlPlaceholder}
          />
          <p className="mt-1 text-xs text-gray-500">{t.required}</p>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            {t.price}
          </label>
          <input
            type="number"
            id="price"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder={t.pricePlaceholder}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          {loading ? (locale === 'es' ? 'Añadiendo...' : 'Adicionando...') : t.addButton}
        </button>
      </form>

      {/* Items List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {items.length === 0 ? t.empty : `${items.length} ${items.length === 1 ? 'item' : 'itens'}`}
        </h3>

        {items.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">{t.empty}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{item.productName}</h4>
                  <p className="text-sm text-gray-500 truncate">{item.productUrl}</p>
                  {item.price && (
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'pt-PT', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(item.price)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t.delete}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

