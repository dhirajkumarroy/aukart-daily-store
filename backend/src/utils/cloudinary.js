import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

function configureCloudinary() {
  const url = process.env.CLOUDINARY_URL;
  if (url && url.startsWith('cloudinary://')) {
    const cleanUrl = url.replace(/['"]/g, '').trim();
    const match = cleanUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [, api_key, api_secret, cloud_name] = match;
      cloudinary.config({
        cloud_name: cloud_name.trim(),
        api_key: api_key.trim(),
        api_secret: api_secret.trim(),
        secure: true
      });
    }
  }
}

// Initial configuration
configureCloudinary();

export function uploadToCloudinary(fileBuffer, folder = 'affiliate-store') {
  // Ensure config is fresh in case env was loaded dynamically
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            imageUrl: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(stream);
  });
}

export async function deleteFromCloudinary(publicId) {
  configureCloudinary();

  if (!publicId) {
    return { result: 'skipped', message: 'No public ID provided' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary asset destroyed [publicId: ${publicId}]:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset [publicId: ${publicId}]:`, error);
    return { result: 'error', error: error.message };
  }
}

export { cloudinary };
