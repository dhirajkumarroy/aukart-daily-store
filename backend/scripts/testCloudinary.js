import dotenv from 'dotenv';
import { uploadToCloudinary, deleteFromCloudinary } from '../src/utils/cloudinary.js';

dotenv.config();

async function test() {
  console.log('Testing Cloudinary configuration with env:', process.env.CLOUDINARY_URL);

  if (!process.env.CLOUDINARY_URL || process.env.CLOUDINARY_URL.includes('mycloudname')) {
    console.log('\n⚠️ WARNING: CLOUDINARY_URL in .env is still using the placeholder value:');
    console.log(process.env.CLOUDINARY_URL);
    console.log('\nPlease update CLOUDINARY_URL in store/backend/.env with your real Cloudinary credentials from cloudinary.com/console.\n');
    return;
  }

  // 1x1 transparent PNG buffer for testing
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );

  try {
    console.log('1. Uploading test asset to Cloudinary...');
    const uploadRes = await uploadToCloudinary(samplePngBuffer, 'affiliate-store/test');
    console.log('✅ Upload Successful!');
    console.log('   - Image URL:', uploadRes.imageUrl);
    console.log('   - Public ID:', uploadRes.publicId);

    console.log('\n2. Testing Cloudinary Destroy/Delete...');
    const deleteRes = await deleteFromCloudinary(uploadRes.publicId);
    console.log('✅ Delete Successful!');
    console.log('   - Delete Response:', deleteRes);

    console.log('\n🎉 Cloudinary CRUD is 100% operational!');
  } catch (err) {
    console.error('❌ Cloudinary Test Failed:', err.message || err);
  }
}

test();
