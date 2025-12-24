import { Client } from "@gradio/client";
import dotenv from 'dotenv';
dotenv.config();

async function inspect() {
  try {
    const token = process.env.HF_TOKEN;
    console.log("Connecting to stabilityai/TripoSR...");
    const client = await Client.connect("stabilityai/TripoSR", { hf_token: token });
    
    console.log("Connected! API Info:");
    const api_info = await client.view_api();
    const fs = await import('fs');
    fs.writeFileSync('api_info.json', JSON.stringify(api_info, null, 2));
    console.log("Saved API info to api_info.json");
    
  } catch (error) {
    console.error("Error connecting:", error);
  }
}

inspect();
