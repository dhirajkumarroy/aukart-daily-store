import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary auto-configures if CLOUDINARY_URL is present in the environment
export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a valid image file.' });
    }

    // Helper to pipe the memory buffer into the Cloudinary upload stream
    const uploadStreamPromise = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'affiliate-store' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null); // Mark end of data stream
        readableStream.pipe(stream);
      });
    };

    const result = await uploadStreamPromise();
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    next(error);
  }
}
