/**
 * Hugging Face API Client for image generation
 * Uses Node 18+ native fetch - no external HTTP libraries required
 */

const HF_MODEL_ID = process.env.HF_MODEL_ID || "stabilityai/stable-diffusion-xl-base-1.0";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL_ID}`;

// Retry configuration for model cold-start
const MAX_RETRIES = 6;
const INITIAL_DELAY_MS = 5000;
const MAX_TOTAL_WAIT_MS = 60000;

/**
 * Generate an image from a text prompt using Hugging Face Inference API
 * @param {string} prompt - Text description of the image to generate
 * @param {number|null} seed - Optional seed for reproducibility (best-effort, may not be supported)
 * @returns {Promise<Buffer>} PNG image buffer
 */
async function generateImage(prompt, seed = null) {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    const error = new Error("HF_API_TOKEN environment variable is not set");
    error.statusCode = 401;
    throw error;
  }

  const payload = { inputs: prompt };
  if (seed !== null && seed !== undefined) {
    payload.parameters = { seed: Number(seed) };
  }

  let lastError = null;
  let totalWaited = 0;
  let delay = INITIAL_DELAY_MS;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Check if response is JSON (error/loading) or binary (success)
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        const data = await response.json();
        
        // Model is loading - wait and retry
        if (data.error && data.estimated_time) {
          const waitTime = Math.min(data.estimated_time * 1000, delay);
          console.log(`HF model loading, waiting ${waitTime}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          
          if (totalWaited + waitTime > MAX_TOTAL_WAIT_MS) {
            const error = new Error("Model loading timeout - please try again later");
            error.statusCode = 503;
            throw error;
          }
          
          await sleep(waitTime);
          totalWaited += waitTime;
          delay = Math.min(delay * 1.5, 15000);
          continue;
        }
        
        // Other error from HF API
        if (data.error) {
          const error = new Error(`Hugging Face API error: ${data.error}`);
          error.statusCode = response.status >= 400 ? response.status : 500;
          throw error;
        }
      }

      // Success - binary image response
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }

      // HTTP error without JSON body
      const error = new Error(`Hugging Face API returned status ${response.status}`);
      error.statusCode = response.status;
      throw error;

    } catch (err) {
      if (err.statusCode) {
        throw err; // Re-throw our custom errors
      }
      lastError = err;
      console.error(`HF API request failed (attempt ${attempt + 1}):`, err.message);
      
      if (totalWaited + delay > MAX_TOTAL_WAIT_MS) {
        break;
      }
      
      await sleep(delay);
      totalWaited += delay;
      delay = Math.min(delay * 1.5, 15000);
    }
  }

  const error = new Error(lastError?.message || "Failed to generate image after multiple attempts");
  error.statusCode = 503;
  throw error;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { generateImage };
