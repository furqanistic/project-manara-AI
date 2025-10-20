// File: server/services/colorExtractor.js
import sharp from 'sharp'

/**
 * Extract dominant color palette from an image
 * @param {string} base64Data - Base64 encoded image data
 * @param {number} numColors - Number of colors to extract (default: 5)
 * @returns {Promise<Array>} Array of color objects with hex, rgb, and percentage
 */
export const extractColorPalette = async (base64Data, numColors = 5) => {
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Resize image to speed up processing (smaller = faster)
    const resizedBuffer = await sharp(imageBuffer)
      .resize(100, 100, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { data, info } = resizedBuffer
    const pixels = []

    // Extract all pixels
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Skip very dark or very bright pixels (likely shadows or highlights)
      const brightness = (r + g + b) / 3
      if (brightness > 20 && brightness < 235) {
        pixels.push({ r, g, b })
      }
    }

    // Use k-means clustering to find dominant colors
    const clusters = kMeansClustering(pixels, numColors)

    // Convert to color palette format
    const palette = clusters.map((cluster) => {
      const { r, g, b } = cluster.centroid
      return {
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`,
        name: getColorName({ r, g, b }),
        percentage: Math.round((cluster.pixels.length / pixels.length) * 100),
      }
    })

    // Sort by percentage (most dominant first)
    palette.sort((a, b) => b.percentage - a.percentage)

    console.log(`Extracted ${palette.length} colors from image`)
    return palette
  } catch (error) {
    console.error('Error extracting color palette:', error)
    // Return default palette if extraction fails
    return getDefaultPalette()
  }
}

/**
 * Simple k-means clustering for color quantization
 */
const kMeansClustering = (pixels, k, maxIterations = 10) => {
  if (pixels.length === 0) return []

  // Initialize centroids randomly
  let centroids = []
  const step = Math.floor(pixels.length / k)
  for (let i = 0; i < k; i++) {
    centroids.push({ ...pixels[i * step] })
  }

  let iterations = 0
  let changed = true

  while (changed && iterations < maxIterations) {
    // Assign pixels to nearest centroid
    const clusters = centroids.map(() => [])

    pixels.forEach((pixel) => {
      let minDist = Infinity
      let nearestCluster = 0

      centroids.forEach((centroid, index) => {
        const dist = colorDistance(pixel, centroid)
        if (dist < minDist) {
          minDist = dist
          nearestCluster = index
        }
      })

      clusters[nearestCluster].push(pixel)
    })

    // Update centroids
    changed = false
    centroids = clusters.map((cluster, index) => {
      if (cluster.length === 0) return centroids[index]

      const newCentroid = {
        r: Math.round(
          cluster.reduce((sum, p) => sum + p.r, 0) / cluster.length
        ),
        g: Math.round(
          cluster.reduce((sum, p) => sum + p.g, 0) / cluster.length
        ),
        b: Math.round(
          cluster.reduce((sum, p) => sum + p.b, 0) / cluster.length
        ),
      }

      if (colorDistance(newCentroid, centroids[index]) > 1) {
        changed = true
      }

      return newCentroid
    })

    iterations++
  }

  // Return clusters with their pixels
  return centroids.map((centroid, index) => ({
    centroid,
    pixels: pixels.filter((pixel) => {
      let minDist = Infinity
      let nearestCluster = 0

      centroids.forEach((c, i) => {
        const dist = colorDistance(pixel, c)
        if (dist < minDist) {
          minDist = dist
          nearestCluster = i
        }
      })

      return nearestCluster === index
    }),
  }))
}

/**
 * Calculate Euclidean distance between two colors
 */
const colorDistance = (c1, c2) => {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
  )
}

/**
 * Convert RGB to HEX
 */
const rgbToHex = (r, g, b) => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

/**
 * Get approximate color name
 */
const getColorName = ({ r, g, b }) => {
  const brightness = (r + g + b) / 3

  // Very dark or very light
  if (brightness < 40) return 'Deep Charcoal'
  if (brightness > 220) return 'Soft White'

  // Determine dominant channel
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const saturation = max === 0 ? 0 : (max - min) / max

  // Grayscale
  if (saturation < 0.15) {
    if (brightness < 85) return 'Dark Gray'
    if (brightness < 170) return 'Medium Gray'
    return 'Light Gray'
  }

  // Determine hue
  if (r > g && r > b) {
    if (g > b) return 'Warm Terracotta'
    return 'Deep Rose'
  } else if (g > r && g > b) {
    if (r > b) return 'Olive Green'
    return 'Sage Green'
  } else if (b > r && b > g) {
    if (r > g) return 'Deep Purple'
    return 'Ocean Blue'
  }

  // Mixed colors
  if (r > 180 && g > 180 && b < 100) return 'Golden Yellow'
  if (r > 180 && g < 100 && b > 180) return 'Rich Magenta'
  if (r < 100 && g > 180 && b > 180) return 'Aqua Blue'

  return 'Warm Neutral'
}

/**
 * Default palette if extraction fails
 */
const getDefaultPalette = () => [
  {
    hex: '#947d61',
    rgb: 'rgb(148, 125, 97)',
    name: 'Warm Taupe',
    percentage: 30,
  },
  {
    hex: '#a68970',
    rgb: 'rgb(166, 137, 112)',
    name: 'Sand Beige',
    percentage: 25,
  },
  {
    hex: '#f5f5f5',
    rgb: 'rgb(245, 245, 245)',
    name: 'Soft White',
    percentage: 20,
  },
  {
    hex: '#8b7355',
    rgb: 'rgb(139, 115, 85)',
    name: 'Warm Brown',
    percentage: 15,
  },
  { hex: '#d4c4b0', rgb: 'rgb(212, 196, 176)', name: 'Cream', percentage: 10 },
]

/**
 * Get complementary colors for a palette
 */
export const getComplementaryColors = (palette) => {
  return palette.map((color) => {
    const rgb = color.rgb.match(/\d+/g).map(Number)
    const complementary = {
      r: 255 - rgb[0],
      g: 255 - rgb[1],
      b: 255 - rgb[2],
    }

    return {
      hex: rgbToHex(complementary.r, complementary.g, complementary.b),
      rgb: `rgb(${complementary.r}, ${complementary.g}, ${complementary.b})`,
      name: `Complementary ${color.name}`,
    }
  })
}
