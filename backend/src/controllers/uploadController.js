import { uploadToCloudinary } from '../utils/cloudinary.js';

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a valid image file.' });
    }

    const { imageUrl, publicId } = await uploadToCloudinary(req.file.buffer, 'affiliate-store');
    res.json({ imageUrl, publicId });
  } catch (error) {
    next(error);
  }
}
