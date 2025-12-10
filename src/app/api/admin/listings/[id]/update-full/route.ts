import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/adminCheck';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify admin
    const { isAdmin, error } = await verifyAdminSession();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: error === 'Authentication required' ? 401 : 403 }
      );
    }

    // Get existing listing
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
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
      languages = [];
    }
    
    // Additional physical attributes
    const bodyType = formData.get('bodyType') as string;
    const hairColor = formData.get('hairColor') as string;
    const breastSize = formData.get('breastSize') as string;
    const breastType = formData.get('breastType') as string;
    
    // Services and additional details
    let services: string[] = [];
    try {
      const servicesStr = formData.get('services') as string;
      services = servicesStr ? JSON.parse(servicesStr) : [];
    } catch (e) {
      services = [];
    }
    
    const minDuration = formData.get('minDuration') as string || '';
    const advanceNotice = formData.get('advanceNotice') as string || '';
    const acceptsCard = formData.get('acceptsCard') as string || '';
    const regularDiscount = formData.get('regularDiscount') as string || '';
    
    // Pricing
    let pricing: any = {};
    try {
      const pricingStr = formData.get('pricing') as string;
      pricing = pricingStr ? JSON.parse(pricingStr) : {};
    } catch (e) {
      pricing = {};
    }
    const showPricing = formData.get('showPricing') === 'true';
    
    // Status and price
    const status = formData.get('status') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null;
    
    // Voice note URL
    const voiceNoteUrl = formData.get('voiceNoteUrl') as string || '';
    
    // Handle file uploads
    const photos = (formData.getAll('photos') || []) as File[];
    const galleryMedia = (formData.getAll('galleryMedia') || []) as File[];
    const comparisonMedia = (formData.getAll('comparisonMedia') || []) as File[];
    
    const uploadedPhotoUrls: string[] = [];
    const uploadedGalleryUrls: string[] = [];
    const uploadedComparisonUrls: string[] = [];
    
    // Upload photos
    if (photos.length > 0) {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'listings', id);
      await mkdir(uploadDir, { recursive: true });
      
      for (const photo of photos) {
        if (photo.size > 0) {
          const bytes = await photo.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-${photo.name}`;
          const filepath = join(uploadDir, filename);
          await writeFile(filepath, buffer);
          uploadedPhotoUrls.push(`/uploads/listings/${id}/${filename}`);
        }
      }
    }
    
    // Upload gallery media
    if (galleryMedia.length > 0) {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'listings', id, 'gallery');
      await mkdir(uploadDir, { recursive: true });
      
      for (const media of galleryMedia) {
        if (media.size > 0) {
          const bytes = await media.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-${media.name}`;
          const filepath = join(uploadDir, filename);
          await writeFile(filepath, buffer);
          uploadedGalleryUrls.push(`/uploads/listings/${id}/gallery/${filename}`);
        }
      }
    }
    
    // Upload comparison media
    if (comparisonMedia.length > 0) {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'listings', id, 'comparison');
      await mkdir(uploadDir, { recursive: true });
      
      for (const media of comparisonMedia) {
        if (media.size > 0) {
          const bytes = await media.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-${media.name}`;
          const filepath = join(uploadDir, filename);
          await writeFile(filepath, buffer);
          uploadedComparisonUrls.push(`/uploads/listings/${id}/comparison/${filename}`);
        }
      }
    }
    
    // Update Profile
    const profile = existingListing.user.profile;
    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          name,
          age,
          city,
          neighborhood: neighborhood || null,
          description: description || null,
          phone: phone || null,
          whatsappEnabled,
          telegramEnabled,
          onlyfans: onlyfans || null,
          privacy: privacy || null,
          instagram: instagram || null,
          twitter: twitter || null,
          tiktok: tiktok || null,
          snapchat: snapchat || null,
          telegramChannel: telegramChannel || null,
          whatsappBusiness: whatsappBusiness || null,
          manyvids: manyvids || null,
          chaturbate: chaturbate || null,
          myfreecams: myfreecams || null,
          livejasmin: livejasmin || null,
          linkHubUrl: linkHubUrl || null,
          gender: gender || null,
          preference: preference || null,
          weight: weight || null,
          height: height || null,
          ethnicity: ethnicity || null,
          eyeColor: eyeColor || null,
          shoeSize: shoeSize || null,
          tattoos: tattoos || null,
          piercings: piercings || null,
          smoker: smoker || null,
          languages: languages.length > 0 ? languages.join(',') : null,
          bodyType: bodyType || null,
          hairColor: hairColor || null,
          breastSize: breastSize || null,
          breastType: breastType || null,
          voiceNoteUrl: voiceNoteUrl || null,
        },
      });
    } else {
      // Create profile if it doesn't exist
      await prisma.profile.create({
        data: {
          userId: existingListing.userId,
          name,
          age,
          city,
          neighborhood: neighborhood || null,
          description: description || null,
          phone: phone || null,
          whatsappEnabled,
          telegramEnabled,
          onlyfans: onlyfans || null,
          privacy: privacy || null,
          instagram: instagram || null,
          twitter: twitter || null,
          tiktok: tiktok || null,
          snapchat: snapchat || null,
          telegramChannel: telegramChannel || null,
          whatsappBusiness: whatsappBusiness || null,
          manyvids: manyvids || null,
          chaturbate: chaturbate || null,
          myfreecams: myfreecams || null,
          livejasmin: livejasmin || null,
          linkHubUrl: linkHubUrl || null,
          gender: gender || null,
          preference: preference || null,
          weight: weight || null,
          height: height || null,
          ethnicity: ethnicity || null,
          eyeColor: eyeColor || null,
          shoeSize: shoeSize || null,
          tattoos: tattoos || null,
          piercings: piercings || null,
          smoker: smoker || null,
          languages: languages.length > 0 ? languages.join(',') : null,
          bodyType: bodyType || null,
          hairColor: hairColor || null,
          breastSize: breastSize || null,
          breastType: breastType || null,
          voiceNoteUrl: voiceNoteUrl || null,
        },
      });
    }
    
    // Update Listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title: name, // Use name as title
        description: description || '',
        price: price,
        location: city, // Use city as location
        city: city || '',
        age: age,
        phone: phone || '',
        services: services.length > 0 ? JSON.stringify(services) : null,
        minDuration: minDuration || null,
        advanceNotice: advanceNotice || null,
        acceptsCard: acceptsCard === 'Sim',
        regularDiscount: regularDiscount || null,
        status: status as any,
      },
    });
    
    // Create Media entries for uploaded files
    if (uploadedPhotoUrls.length > 0 || uploadedGalleryUrls.length > 0 || uploadedComparisonUrls.length > 0) {
      const mediaData = [
        ...uploadedPhotoUrls.map(url => ({
          url,
          type: 'IMAGE' as const,
          listingId: id,
        })),
        ...uploadedGalleryUrls.map(url => ({
          url,
          type: 'IMAGE' as const,
          listingId: id,
        })),
        ...uploadedComparisonUrls.map(url => ({
          url,
          type: 'VIDEO' as const,
          listingId: id,
        })),
      ];
      
      await prisma.media.createMany({
        data: mediaData,
      });
    }
    
    return NextResponse.json({
      success: true,
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

