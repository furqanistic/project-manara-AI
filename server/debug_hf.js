
import { Client } from "@gradio/client";
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const HF_TOKEN = process.env.HF_TOKEN;
const PRIVATE_SPACE = "ManaraD/Hunyuan3D-2.1";
const PUBLIC_SPACE = "Tencent/Hunyuan3D-2"; // Assuming this is public or another known public one like "black-forest-labs/FLUX.1-schnell"

async function runDiagnostics() {
    console.log("--- Diagnostics Start ---");
    
    // 1. Check Token Presence & Identity
    if (!HF_TOKEN) {
        console.error("❌ HF_TOKEN is MISSING in process.env");
    } else {
        console.log(`✅ HF_TOKEN is present (Length: ${HF_TOKEN.length})`);
        
        try {
            const response = await fetch("https://huggingface.co/api/whoami-v2", {
                headers: { Authorization: `Bearer ${HF_TOKEN}` }
            });
            if (response.ok) {
                const user = await response.json();
                console.log(`👤 Token belongs to user: @${user.name} (Type: ${user.type})`);
                console.log(`   Orgs: ${user.orgs ? user.orgs.map(o => o.name).join(', ') : 'None'}`);
                
                // Permission hint
                if (user.name !== 'ManaraD' && (!user.orgs || !user.orgs.some(o => o.name === 'ManaraD'))) {
                    console.log(`⚠️  Warning: This user (@${user.name}) does not seem to be a member of 'ManaraD'. This explains the access error!`);
                }
            } else {
                console.log("❌ Token is invalid (API verification failed).");
            }
        } catch (e) {
            console.log("⚠️  Could not verify token identity:", e.message);
        }
    }

    // 2. Test Connection to Private Space
    try {
        console.log(`\nTesting connection to PRIVATE space: ${PRIVATE_SPACE}...`);
        const client = await Client.connect(PRIVATE_SPACE, { hf_token: HF_TOKEN });
        console.log("✅ Successfully connected to Private Space!");
    } catch (error) {
        console.error("❌ Failed to connect to Private Space.");
        console.error("   Error:", error.message);
        if (error.message.includes("metadata")) {
            console.error("   Possible causes: Invalid Token, Unauthorized (Token doesn't have access), or Space is paused/sleeping.");
        }
    }

    // 3. Test Connection to Public Space (Alternative)
    try {
        const publicSpace = "Tencent/Hunyuan3D-2"; 
        console.log(`\nTesting connection to PUBLIC space: ${publicSpace} (Alternative)...`);
        const clientPublic = await Client.connect(publicSpace, { hf_token: HF_TOKEN }); 
        console.log("✅ Successfully connected to Public Space (Tencent/Hunyuan3D-2)!");
    } catch (error) {
        console.error(`❌ Failed to connect to Public Space ${publicSpace}.`);
        console.error("   Error:", error.message);
    }
    
    console.log("\n--- Diagnostics End ---");
}

runDiagnostics();
