const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload and process an image file
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Image URL
 */
const uploadImage = async (file) => {
  try {
    const imageBuffer = file.buffer;
    const imageName = `medicine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    const imagePath = path.join(uploadsDir, imageName);
    
    // Resize and optimize image
    await sharp(imageBuffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(imagePath);

    return `/uploads/${imageName}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Process image for analysis
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} - Processed image data
 */
const processImage = async (imageBuffer) => {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    // Resize for analysis if needed
    const processedBuffer = await sharp(imageBuffer)
      .resize(400, 300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    return {
      buffer: processedBuffer,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: imageBuffer.length
      }
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Generate thumbnail for an image
 * @param {Buffer} imageBuffer - Image buffer
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {Promise<Buffer>} - Thumbnail buffer
 */
const generateThumbnail = async (imageBuffer, width = 150, height = 150) => {
  try {
    return await sharp(imageBuffer)
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

/**
 * Validate image file
 * @param {Object} file - Multer file object
 * @returns {boolean} - Is valid
 */
const validateImage = (file) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    return false;
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
};

module.exports = {
  uploadImage,
  processImage,
  generateThumbnail,
  validateImage
};
