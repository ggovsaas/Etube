import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param file - File object to upload
 * @param folder - Cloudinary folder name (e.g., 'listings', 'profiles', 'audio')
 * @param resourceType - 'image', 'video', or 'raw' (for audio files)
 * @returns Cloudinary secure URL
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'uploads',
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<string> {
  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
          // For audio files, preserve original filename
          public_id: resourceType === 'raw' ? file.name.replace(/\.[^/.]+$/, '') : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public ID of the file
 * @param resourceType - 'image', 'video', or 'raw'
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

export default cloudinary;
