import { prisma } from '@/lib/prisma';
import { getWooProductDetails } from '@/lib/services/woocommerce';

export interface WishlistItem {
  id: string;
  productName: string;
  productUrl: string;
  price: number | null;
  isFulfilled: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  // WooCommerce enriched data
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

/**
 * Extracts WooCommerce product ID from a product URL
 * 
 * @param url - Product URL (can be full URL or just product ID)
 * @returns Product ID or null
 */
function extractWooProductId(url: string): string | null {
  if (!url) return null;
  
  // If URL contains product ID pattern
  const idMatch = url.match(/product[\/\-_](\d+)/i) || url.match(/\/(\d+)\/?$/);
  if (idMatch) {
    return idMatch[1];
  }
  
  // If it's just a number, assume it's a product ID
  if (/^\d+$/.test(url.trim())) {
    return url.trim();
  }
  
  return null;
}

/**
 * Fetches all unfulfilled wishlist items for a specific creator/user.
 * Enriches each item with live WooCommerce product data (price, stock).
 * 
 * @param userId - The ID of the creator/user
 * @returns Array of unfulfilled wishlist items with WooCommerce data
 */
export async function getCreatorWishlist(userId: string): Promise<WishlistItem[]> {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: {
        userId: userId,
        isFulfilled: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Enrich items with WooCommerce data
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const baseItem: WishlistItem = {
          id: item.id,
          productName: item.productName,
          productUrl: item.productUrl,
          price: item.price,
          isFulfilled: item.isFulfilled,
          userId: item.userId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        };

        // Try to extract WooCommerce product ID from URL
        const wooProductId = extractWooProductId(item.productUrl);
        
        if (wooProductId) {
          baseItem.wooProductId = wooProductId;
          
          // Fetch live product details from WooCommerce
          const wooDetails = await getWooProductDetails(wooProductId);
          
          if (wooDetails) {
            baseItem.wooDetails = {
              currentPrice: wooDetails.price,
              regularPrice: wooDetails.regularPrice,
              salePrice: wooDetails.salePrice,
              stockStatus: wooDetails.stockStatus,
              inStock: wooDetails.inStock,
              purchasable: wooDetails.purchasable
            };
            
            // Update product URL to use WooCommerce permalink if available
            if (wooDetails.url) {
              baseItem.productUrl = wooDetails.url;
            }
            
            // Update price from WooCommerce if available
            if (wooDetails.price > 0) {
              baseItem.price = wooDetails.price;
            }
          }
        }

        return baseItem;
      })
    );

    return enrichedItems;
  } catch (error: any) {
    // If table doesn't exist yet (migration not run), return empty array
    if (error?.code === 'P2021' || error?.message?.includes('does not exist') || error?.message?.includes('WishlistItem')) {
      console.warn('WishlistItem table does not exist yet. Run migration: npx prisma db push');
      return [];
    }
    throw error;
  }
}

