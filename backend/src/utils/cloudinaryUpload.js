import { cloudinary } from "../config/cloudinary.js";

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder path
 * @param {object} options - Additional cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
export function uploadBuffer(buffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      // access_control: anonymous ensures the asset is publicly readable even
      // on Cloudinary accounts that have Strict Delivery Mode enabled.
      // (access_mode is deprecated; access_control is the current approach.)
      { folder, access_control: [{ access_type: "anonymous" }], ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary by its public_id.
 * Non-blocking — logs a warning on failure but does not throw.
 * @param {string} publicId - Cloudinary public_id
 * @param {"image"|"raw"|"video"} resourceType
 */
export async function deleteAsset(publicId, resourceType = "image") {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    console.warn(`[Cloudinary] Could not delete asset: ${publicId}`);
  }
}
