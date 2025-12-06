/**
 * WooCommerce REST API Service
 * 
 * This service handles authenticated requests to WooCommerce REST API
 * to fetch product details, prices, and stock status.
 */

interface WooCommerceProduct {
  id: number;
  name: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  purchasable: boolean;
  in_stock: boolean;
}

interface WooCommerceProductDetails {
  id: number;
  name: string;
  url: string;
  price: number;
  regularPrice: number;
  salePrice: number | null;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  stockQuantity: number | null;
  purchasable: boolean;
  inStock: boolean;
}

/**
 * Fetches product details from WooCommerce REST API
 * 
 * @param productId - WooCommerce product ID
 * @returns Product details with price and stock information
 */
export async function getWooProductDetails(productId: string): Promise<WooCommerceProductDetails | null> {
  const woocommerceUrl = process.env.WOOCOMMERCE_URL;
  const consumerKey = process.env.WOO_CONSUMER_KEY;
  const consumerSecret = process.env.WOO_CONSUMER_SECRET;

  if (!woocommerceUrl || !consumerKey || !consumerSecret) {
    console.warn('WooCommerce credentials not configured');
    return null;
  }

  try {
    // WooCommerce REST API uses Basic Auth with consumer key and secret
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    const url = `${woocommerceUrl}/wp-json/wc/v3/products/${productId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes to reduce API calls (Next.js fetch caching)
      ...(typeof window === 'undefined' ? { next: { revalidate: 300 } } : { cache: 'no-store' })
    });

    if (!response.ok) {
      console.error(`WooCommerce API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const product: WooCommerceProduct = await response.json();

    return {
      id: product.id,
      name: product.name,
      url: product.permalink,
      price: parseFloat(product.sale_price || product.price || '0'),
      regularPrice: parseFloat(product.regular_price || product.price || '0'),
      salePrice: product.sale_price ? parseFloat(product.sale_price) : null,
      stockStatus: product.stock_status,
      stockQuantity: product.stock_quantity,
      purchasable: product.purchasable,
      inStock: product.in_stock && product.stock_status === 'instock'
    };
  } catch (error) {
    console.error('Error fetching WooCommerce product:', error);
    return null;
  }
}

/**
 * Builds a WooCommerce cart URL with product pre-filled
 * 
 * @param productId - WooCommerce product ID
 * @param quantity - Quantity to add (default: 1)
 * @returns WooCommerce add-to-cart URL
 */
export function buildWooCommerceCartUrl(productId: string, quantity: number = 1): string {
  const woocommerceUrl = process.env.WOOCOMMERCE_URL;
  
  if (!woocommerceUrl) {
    return '#';
  }

  // WooCommerce add-to-cart URL format
  return `${woocommerceUrl}/?add-to-cart=${productId}&quantity=${quantity}`;
}

