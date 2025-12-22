import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get Credit Packages
 * 
 * Returns all active credit packages from the database
 */
export async function GET(request: NextRequest) {
  try {
    // Try to fetch from database first
    const packages = await prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    // If packages exist in database, return them
    if (packages.length > 0) {
      return NextResponse.json({
        packages: packages.map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          credits: pkg.credits,
          priceUSD: pkg.priceUSD,
          costPerCredit: pkg.costPerCredit,
          discountPercent: pkg.discountPercent,
        })),
      });
    }

    // Fallback: Return hardcoded packages if database is empty
    // These should match the packages in /api/checkout/credits
    return NextResponse.json({
      packages: [
        {
          id: 'credits_starter',
          name: 'Starter',
          credits: 250,
          priceUSD: 25.00,
          costPerCredit: 0.10,
          discountPercent: 0,
        },
        {
          id: 'credits_standard',
          name: 'Standard',
          credits: 550,
          priceUSD: 50.00,
          costPerCredit: 0.091,
          discountPercent: 8.8,
        },
        {
          id: 'credits_pro',
          name: 'Pro Pack',
          credits: 1200,
          priceUSD: 100.00,
          costPerCredit: 0.083,
          discountPercent: 17,
        },
        {
          id: 'credits_vip',
          name: 'VIP Bulk',
          credits: 3250,
          priceUSD: 250.00,
          costPerCredit: 0.077,
          discountPercent: 23,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


