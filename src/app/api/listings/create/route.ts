import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { sendPendingListingNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    // Basic info
    const name = formData.get('name') as string;
    const age = parseInt(formData.get('age') as string);
    const city = formData.get('city') as string;
    const neighborhood = formData.get('neighborhood') as string;
    const phone = formData.get('phone') as string;
    const description = formData.get('description') as string;
    const whatsappEnabled = formData.get('whatsappEnabled') === 'true';
    const telegramEnabled = formData.get('telegramEnabled') === 'true';
    
    // Social Media Links
    const onlyfans = formData.get('onlyfans') as string;
    const privacy = formData.get('privacy') as string;
    const instagram = formData.get('instagram') as string;
    const twitter = formData.get('twitter') as string;
    const tiktok = formData.get('tiktok') as string;
    const snapchat = formData.get('snapchat') as string;
    const telegramChannel = formData.get('telegramChannel') as string;
    const whatsappBusiness = formData.get('whatsappBusiness') as string;
    const manyvids = formData.get('manyvids') as string;
    const chaturbate = formData.get('chaturbate') as string;
    const myfreecams = formData.get('myfreecams') as string;
    const livejasmin = formData.get('livejasmin') as string;
    const linkHubUrl = formData.get('linkHubUrl') as string;
    
    // Physical details
    const gender = formData.get('gender') as string;
    const preference = formData.get('preference') as string;
    const weight = formData.get('weight') as string;
    const height = formData.get('height') as string;
    const ethnicity = formData.get('ethnicity') as string;
    const eyeColor = formData.get('eyeColor') as string;
    const shoeSize = formData.get('shoeSize') as string;
    const tattoos = formData.get('tattoos') as string;
    const piercings = formData.get('piercings') as string;
    const smoker = formData.get('smoker') as string;
    let languages: string[] = [];
    try {
      const languagesStr = formData.get('languages') as string;
      languages = languagesStr ? JSON.parse(languagesStr) : [];
    } catch (e) {
      console.error('Error parsing languages:', e);
      languages = [];
    }
    
    // NEW: Additional physical attributes
    const bodyType = formData.get('bodyType') as string;
    const hairColor = formData.get('hairColor') as string;
    const breastSize = formData.get('breastSize') as string;
    const breastType = formData.get('breastType') as string;
    const personalityTags = JSON.parse(formData.get('personalityTags') as string || '[]');
    
    // Services and additional details
    let services: string[] = [];
    try {
      const servicesStr = formData.get('services') as string;
      services = servicesStr ? JSON.parse(servicesStr) : [];
    } catch (e) {
      console.error('Error parsing services:', e);
      services = [];
    }
    
    const minDuration = formData.get('minDuration') as string || '';
    const advanceNotice = formData.get('advanceNotice') as string || '';
    const acceptsCard = formData.get('acceptsCard') as string || '';
    const regularDiscount = formData.get('regularDiscount') as string || '';
    
    // Pricing (optional)
    let pricing: any = {};
    try {
      const pricingStr = formData.get('pricing') as string;
      pricing = pricingStr ? JSON.parse(pricingStr) : {};
    } catch (e) {
      console.error('Error parsing pricing:', e);
      pricing = {};
    }
    const showPricing = formData.get('showPricing') === 'true';
    
    // Photos - handle empty arrays
    const photos = (formData.getAll('photos') || []) as File[];
    const galleryMedia = (formData.getAll('galleryMedia') || []) as File[];
    const comparisonMedia = (formData.getAll('comparisonMedia') || []) as File[];
    
    console.log('Files received:', {
      photos: photos.length,
      galleryMedia: galleryMedia.length,
      comparisonMedia: comparisonMedia.length
    });

    // Validate required fields
    if (!name || !age || !city || !phone || !description) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Get user by email from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create or update profile
    let profile = user.profile;
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          name,
          age,
          city,
          description,
          phone,
          bio: description,
          location: city,
          neighborhood,
          height: height ? height : null,
          weight: weight ? weight : null,
          gender,
          preference,
          ethnicity,
          eyeColor,
          shoeSize: shoeSize ? shoeSize : null,
          tattoos,
          piercings,
          smoker,
          languages: languages.length > 0 ? JSON.stringify(languages) : null,
          bodyType,
          hairColor,
          breastSize,
          breastType,
          personalityTags,
          // Social media links
          onlyfans,
          privacy,
          instagram,
          twitter,
          tiktok,
          snapchat,
          telegramChannel,
          whatsappBusiness,
          manyvids,
          chaturbate,
          myfreecams,
          livejasmin,
          linkHubUrl,
          // Contact preferences
          whatsappEnabled,
          telegramEnabled,
        }
      });
    } else {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          name,
          age,
          city,
          description,
          phone,
          bio: description,
          location: city,
          neighborhood,
          height: height ? height : null,
          weight: weight ? weight : null,
          gender,
          preference,
          ethnicity,
          eyeColor,
          shoeSize: shoeSize ? shoeSize : null,
          tattoos,
          piercings,
          smoker,
          languages: languages.length > 0 ? JSON.stringify(languages) : null,
          bodyType,
          hairColor,
          breastSize,
          breastType,
          personalityTags,
          // Social media links
          onlyfans,
          privacy,
          instagram,
          twitter,
          tiktok,
          snapchat,
          telegramChannel,
          whatsappBusiness,
          manyvids,
          chaturbate,
          myfreecams,
          livejasmin,
          linkHubUrl,
          // Contact preferences
          whatsappEnabled,
          telegramEnabled,
        }
      });
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        title: `${name} - ${city}`,
        description,
        city,
        location: city,
        age,
        phone,
        services: services.join(', '),
        status: 'PENDING', // Changed to PENDING for admin approval
        isPremium: false,
        userId: user.id,
        price: pricing.local?.oneHour ? parseFloat(pricing.local.oneHour) : 0,
        minDuration: minDuration || null,
        advanceNotice: advanceNotice || null,
        acceptsCard: acceptsCard === 'true' || acceptsCard === 'Sim',
        regularDiscount: regularDiscount || null,
      }
    });

    // Handle photo uploads (simplified - in production you'd upload to cloud storage)
    const allMedia = [
      ...photos.map(file => ({ file, type: 'GALLERY' })),
      ...galleryMedia.map(file => ({ file, type: 'GALLERY' })),
      ...comparisonMedia.map(file => ({ file, type: 'COMPARISON' }))
    ];

    console.log('Total media files to process:', allMedia.length);

    if (allMedia.length > 0) {
      const mediaPromises = allMedia.slice(0, 10).map(async (mediaItem, index) => {
        try {
          const { file, type } = mediaItem;
          
          console.log(`Processing file ${index}:`, {
            name: file.name,
            type: file.type,
            size: file.size,
            mediaType: type
          });
          
          // Determine media type based on file type
          const isVideo = file.type.startsWith('video/');
          const mediaType = isVideo ? 'VIDEO' : 'IMAGE';
          
          // Get file extension from original filename or default
          const originalExtension = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
          const extension = originalExtension.startsWith('.') ? originalExtension : `.${originalExtension}`;
          const filename = `profile-${profile.id}-${type}-${index}-${Date.now()}${extension}`;
          
          console.log(`Saving file: ${filename}`);
          
          // Ensure uploads directory exists
          const uploadsDir = join(process.cwd(), 'public', 'uploads');
          try {
            await mkdir(uploadsDir, { recursive: true });
          } catch (error) {
            // Directory might already exist, that's fine
            console.log('Uploads directory check:', error);
          }
          
          // Convert File to Buffer and save to disk
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filePath = join(uploadsDir, filename);
          await writeFile(filePath, buffer);
          
          console.log(`File saved to: ${filePath}`);
          console.log(`Creating media record for: ${filename}`);
          
          // Create media record for both profile and listing
          const mediaRecord = await prisma.media.create({
            data: {
              url: `/uploads/${filename}`,
              type: mediaType,
              profileId: profile.id,
              listingId: listing.id // Link to listing so it shows up
            }
          });
          
          // Also create Image record for listing.images
          await prisma.image.create({
            data: {
              url: `/uploads/${filename}`,
              listingId: listing.id
            }
          });
          
          console.log(`Successfully created media record:`, mediaRecord.id);
          return mediaRecord;
        } catch (error) {
          console.error(`Error creating media record for file ${index}:`, error);
          // Continue with other files even if one fails
          return null;
        }
      });

      // Wait for all media records to be created
      const mediaResults = await Promise.all(mediaPromises);
      const successfulMedia = mediaResults.filter(r => r !== null);
      console.log(`Successfully created ${successfulMedia.length} out of ${allMedia.length} media records`);
    }

    // Store pricing information if provided
    if (showPricing && pricing) {
      let pricingInfo = `\n\nPreços:\n`;
      
      // Add minimum duration pricing if selected
      if (pricing.local?.fifteenMin) {
        pricingInfo += `Local 15min: €${pricing.local.fifteenMin}\n`;
      }
      if (pricing.local?.thirtyMin) {
        pricingInfo += `Local 30min: €${pricing.local.thirtyMin}\n`;
      }
      if (pricing.travel?.fifteenMin) {
        pricingInfo += `Deslocação 15min: €${pricing.travel.fifteenMin}\n`;
      }
      if (pricing.travel?.thirtyMin) {
        pricingInfo += `Deslocação 30min: €${pricing.travel.thirtyMin}\n`;
      }
      
      // Add regular pricing
      pricingInfo += `Local: 1h €${pricing.local?.oneHour || 'N/A'}, 2h €${pricing.local?.twoHours || 'N/A'}, Pernoite €${pricing.local?.overnight || 'N/A'}\n`;
      pricingInfo += `Deslocação: 1h €${pricing.travel?.oneHour || 'N/A'}, 2h €${pricing.travel?.twoHours || 'N/A'}, Pernoite €${pricing.travel?.overnight || 'N/A'}`;
      
      await prisma.listing.update({ where: { id: listing.id }, data: { description: listing.description + pricingInfo } });
    }

    // Send pending listing notification to admin
    try {
      await sendPendingListingNotification(
        listing.id,
        listing.title,
        user.name || 'Unnamed User',
        user.email!
      );
    } catch (emailError) {
      console.error('Failed to send pending listing notification:', emailError);
      // Don't fail listing creation if email fails
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        title: listing.title,
        status: listing.status
      },
      profile: {
        id: profile.id,
        name: profile.name
      }
    });

  } catch (error) {
    console.error('Error creating listing:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 