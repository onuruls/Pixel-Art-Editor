require('dotenv').config();
// Native fetch in Node 18+

const token = process.env.HF_API_TOKEN;
const model = "stabilityai/stable-diffusion-2-1";

const urls = [
  // SDXL
  `https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0`,
  // FLUX schnell (often free)
  `https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell`,
];

async function test() {
  if (!token) {
    console.error("No token provided");
    return;
  }
  
  for (const url of urls) {
    console.log(`Testing URL: ${url}`);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: "test" })
      });
      console.log(`Status: ${res.status}`);
      const type = res.headers.get("content-type");
      console.log(`Type: ${type}`);
      
      if (type && type.includes("application/json")) {
         const data = await res.json();
         console.log("Body:", JSON.stringify(data));
      } else {
         console.log("Body: (binary/other)");
      }
    } catch (e) {
      console.error("Error:", e.message);
    }
    console.log("---");
  }
}

test();
