import { Client } from "@gradio/client";
import { Blob } from 'buffer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const SPACE_ID = process.env.TRELLIS_SPACE_ID || "microsoft/TRELLIS.2";

/**
 * Generate a 3D model using Microsoft TRELLIS.2 via Gradio Client
 * @param {Buffer} imageBuffer - The 2D floor plan image buffer
 * @param {string} mimeType - Image mime type
 * @returns {Promise<{url: string, path: string}>} - The local URL and path to the generated GLB file
 */
export const generateTrellisModel = async (imageBuffer, mimeType) => {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN is not defined in environment variables');
  }

  try {
    console.log(`Connecting to ${SPACE_ID}...`);
    const client = await Client.connect(SPACE_ID, { hf_token: HF_TOKEN });

    console.log('Starting session...');
    await client.predict("/start_session", {});

    console.log('Sending image for 3D generation...');
    
    // Create a Blob from the buffer (Node.js 18+ supports global Blob, or import from buffer)
    const imageBlob = new Blob([imageBuffer], { type: mimeType });

    // Step 1: Image to 3D
    // We strictly use named parameters matching the API definition we gathered
    const generationResult = await client.predict("/image_to_3d", { 
        image: imageBlob,
        seed: 0,
        resolution: "1024",
        ss_guidance_strength: 7.5,
        ss_guidance_rescale: 0.7,
        ss_sampling_steps: 12,
        ss_rescale_t: 5,
        shape_slat_guidance_strength: 7.5,
        shape_slat_guidance_rescale: 0.5,
        shape_slat_sampling_steps: 12,
        shape_slat_rescale_t: 3,
        tex_slat_guidance_strength: 1,
        tex_slat_guidance_rescale: 0,
        tex_slat_sampling_steps: 12,
        tex_slat_rescale_t: 3
    });

    console.log('3D generation step complete. Extracting GLB...');

    // Step 2: Extract GLB
    // The "state" parameter is usually handled internally or ignored if hidden.
    const extractionResult = await client.predict("/extract_glb", { 
        decimation_target: 300000,
        texture_size: 2048
    });

    console.log('Extraction complete. Result:', extractionResult.data);

    // The result data typically contains the file info.
    // Based on inspection, returns: [Extracted GLB (Model3d), Download GLB (Downloadbutton)]
    // Both are type "filepath" in python_type.
    // Gradio client usually returns an array in .data

    const glbFile = extractionResult.data[1] || extractionResult.data[0];
    
    if (!glbFile || !glbFile.url) {
        // Sometimes it returns just the object if it's a single return, but here it's multiple.
        // Let's inspect what we got if it fails.
        // If it's a file object: { path, url, orig_name, size, mime_type }
        throw new Error('No GLB file returned from extraction');
    }

    console.log('Downloading GLB from:', glbFile.url);

    // Download the file
    const response = await fetch(glbFile.url);
    if (!response.ok) throw new Error(`Failed to download GLB: ${response.statusText}`);
    
    const glbArrayBuffer = await response.arrayBuffer();
    const glbBuffer = Buffer.from(glbArrayBuffer);

    // Generate a unique filename
    const filename = `trellis-${uuidv4()}.glb`;
    const uploadsDir = path.join(process.cwd(), 'uploads', '3d');
    const filePath = path.join(uploadsDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Write binary data to file
    fs.writeFileSync(filePath, glbBuffer);
    console.log('Saved generated GLB model to:', filePath);

    // Return the local URL and path
    return {
      url: `/uploads/3d/${filename}`,
      path: filePath,
    };

  } catch (error) {
    console.error('Error generating TRELLIS model:', error);
    throw new Error(`Failed to generate 3D model via TRELLIS: ${error.message}`);
  }
}
