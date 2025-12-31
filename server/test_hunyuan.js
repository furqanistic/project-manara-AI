import fs from 'fs';
import path from 'path';
import { generateHunyuan3DModel } from './services/huggingFaceService.js';

async function testHunyuan() {
    try {
        console.log('Testing Hunyuan3D-2.1 integration...');
        
        // Use a sample image if available, or just a dummy buffer for connection test
        // Actually, the service needs a real image to process.
        // I'll try to find an image in the project to test with.
        const sampleImage = path.join(process.cwd(), 'uploads', 'floorplan_sample.png');
        
        let imageBuffer;
        if (fs.existsSync(sampleImage)) {
            imageBuffer = fs.readFileSync(sampleImage);
        } else {
            console.log('Sample image not found, using a dummy buffer (this might fail Hunyuan3D validation but tests connection)');
            imageBuffer = Buffer.alloc(100); // Dummy buffer
        }

        const result = await generateHunyuan3DModel(imageBuffer, 'image/png');
        console.log('Success!', result);
    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testHunyuan();
