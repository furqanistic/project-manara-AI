import dotenv from 'dotenv'
dotenv.config()

const SPACE_ID = "ManaraD/Hunyuan3D-2.1"
const HF_TOKEN = process.env.HF_TOKEN

async function checkSpaceAPI() {
  try {
    // Try to get Space info
    const infoUrl = `https://huggingface.co/api/spaces/${SPACE_ID}`
    console.log('Fetching Space info from:', infoUrl)
    
    const response = await fetch(infoUrl, {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`
      }
    })
    
    if (!response.ok) {
      console.error('Failed to fetch Space info:', response.status, response.statusText)
      return
    }
    
    const info = await response.json()
    console.log('\n=== Space Info ===')
    console.log(JSON.stringify(info, null, 2))
    
    // Try to get API info from Gradio
    const apiInfoUrl = `https://${SPACE_ID.toLowerCase().replace(/[/.]/g, '-')}.hf.space/info`
    console.log('\n\nFetching Gradio API info from:', apiInfoUrl)
    
    const apiResponse = await fetch(apiInfoUrl, {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`
      }
    })
    
    if (apiResponse.ok) {
      const apiInfo = await apiResponse.json()
      console.log('\n=== Gradio API Info ===')
      console.log(JSON.stringify(apiInfo, null, 2))
    } else {
      console.error('Failed to fetch API info:', apiResponse.status, apiResponse.statusText)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkSpaceAPI()
