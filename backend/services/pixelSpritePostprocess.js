/**
 * Pixel Sprite Post-processor
 * Converts AI-generated images to pixel-art friendly 64x64 sprites
 */

const sharp = require("sharp");

const TARGET_SIZE = 64;
const DEFAULT_PALETTE = 32;
const BG_COLOR_THRESHOLD = 25; // Color distance threshold for background removal

/**
 * Process an image buffer to create a pixel-art sprite
 * @param {Buffer} inputBuffer - Input image buffer (PNG/JPEG from HF)
 * @param {Object} options - Processing options
 * @param {number} options.palette - Number of colors (16, 32, or 64)
 * @param {boolean} options.removeBackground - Whether to remove background
 * @returns {Promise<Buffer>} 64x64 PNG buffer
 */
async function processToPixelSprite(inputBuffer, options = {}) {
  const palette = options.palette || DEFAULT_PALETTE;
  const removeBackground = options.removeBackground === true;

  // Start with the input image
  let image = sharp(inputBuffer);

  // Ensure we have RGBA
  image = image.ensureAlpha();

  // 1. Resize Image
  image = image.resize(TARGET_SIZE, TARGET_SIZE, {
    fit: "cover",
    position: "center",
  });

  // Get raw pixel data for background removal
  if (removeBackground) {
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    const processedData = removeBackgroundFromRaw(data, info.width, info.height);

    // Create new image from processed data
    image = sharp(processedData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    });
  }

  // Output as PNG with palette quantization for pixel-art look
  return image
    .png({
      palette: true,
      colours: palette,
      dither: 0, // No dithering for crisp pixel art
    })
    .toBuffer();
}

/**
 * Remove background by sampling corner colors and making similar pixels transparent
 * @param {Buffer} data - Raw RGBA pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Buffer} Processed RGBA data
 */
function removeBackgroundFromRaw(data, width, height) {
  const result = Buffer.from(data);

  // Sample corners (top-left, top-right, bottom-left, bottom-right)
  const corners = [
    getPixel(data, 0, 0, width),
    getPixel(data, width - 1, 0, width),
    getPixel(data, 0, height - 1, width),
    getPixel(data, width - 1, height - 1, width),
  ];

  // Calculate average background color from corners
  const bgColor = {
    r: Math.round(corners.reduce((sum, c) => sum + c.r, 0) / 4),
    g: Math.round(corners.reduce((sum, c) => sum + c.g, 0) / 4),
    b: Math.round(corners.reduce((sum, c) => sum + c.b, 0) / 4),
  };

  // Check if corners are similar enough to be considered background
  const cornersSimilar = corners.every(
    (c) => colorDistance(c, bgColor) < BG_COLOR_THRESHOLD * 2
  );

  if (!cornersSimilar) {
    // Corners too different - background detection unreliable, skip removal
    return result;
  }

  // Make pixels close to background color transparent
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixel = {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
      };

      if (colorDistance(pixel, bgColor) < BG_COLOR_THRESHOLD) {
        result[idx + 3] = 0; // Set alpha to 0
      }
    }
  }

  return result;
}

/**
 * Get pixel color at coordinates
 */
function getPixel(data, x, y, width) {
  const idx = (y * width + x) * 4;
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3],
  };
}

/**
 * Calculate Euclidean distance between two colors
 */
function colorDistance(c1, c2) {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

module.exports = { processToPixelSprite, TARGET_SIZE };
