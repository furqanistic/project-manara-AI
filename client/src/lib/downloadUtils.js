/**
 * Force-downloads an image from a URL or Data URL.
 * Uses server-side proxy to bypass CORS restrictions and ensure reliable downloads.
 * 
 * @param {string} url - The URL of the image to download
 * @param {string} originalFilename - The preferred filename for the download
 */
export const downloadImage = async (url, originalFilename = 'manara-asset') => {
  if (!url) return false;
  const filename = originalFilename.endsWith('.png') ? originalFilename : `${originalFilename}.png`;

  try {
    // 1. Data URL branch - Direct download
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    // 2. For remote URLs (including Cloudinary), use server-side proxy
    // This bypasses ALL CORS restrictions and ensures the download works
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8800';
    const proxyUrl = `${apiUrl}/api/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    
    // Create a hidden link and trigger download
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup after a short delay
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
    
    return true;
  } catch (err) {
    console.error('CRITICAL: Download utility failure:', err);
    // Final desperate fallback - open in new tab
    window.open(url, '_blank');
    return false;
  }
};
