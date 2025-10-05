// File: server/services/imageCompositor.js
import sharp from 'sharp'

/**
 * Helper to convert base64 to buffer, handling data URI prefixes
 */
const base64ToBuffer = (base64Data) => {
  // Remove data URI prefix if present (e.g., "data:image/png;base64,")
  const base64String = base64Data.includes(',')
    ? base64Data.split(',')[1]
    : base64Data

  return Buffer.from(base64String, 'base64')
}

/**
 * Create a composite moodboard from multiple images
 */
export const createCompositeMoodboard = async (
  images,
  layout = 'grid',
  aspectRatio = '1:1'
) => {
  try {
    console.log(
      `Creating composite with ${images.length} images in ${layout} layout`
    )

    if (!images || images.length === 0) {
      throw new Error('No images provided for composition')
    }

    // Parse aspect ratio
    const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number)

    // Define canvas dimensions
    const canvasWidth = 2048
    const canvasHeight = Math.round(canvasWidth * (heightRatio / widthRatio))

    const imageCount = images.length

    let result

    if (layout === 'single' || imageCount === 1) {
      // Single image - just resize
      const buffer = base64ToBuffer(images[0].data)
      result = await sharp(buffer)
        .resize(canvasWidth, canvasHeight, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toBuffer()

      console.log('Single image composite created')
    } else if (layout === 'collage') {
      result = await createCollageLayout(images, canvasWidth, canvasHeight)
    } else {
      // Grid layout
      result = await createGridLayout(images, canvasWidth, canvasHeight)
    }

    // Convert to base64
    const compositeBase64 = result.toString('base64')

    console.log('Composite moodboard created successfully')

    return {
      data: compositeBase64,
      mimeType: 'image/png',
      width: canvasWidth,
      height: canvasHeight,
    }
  } catch (error) {
    console.error('Error creating composite moodboard:', error)
    throw new Error(`Failed to create composite: ${error.message}`)
  }
}

/**
 * Create a grid layout composite
 */
const createGridLayout = async (images, width, height) => {
  const count = images.length
  const gap = 20

  console.log(`Creating grid layout with ${count} images`)

  // Determine grid dimensions
  let cols, rows
  if (count <= 2) {
    cols = count
    rows = 1
  } else if (count <= 4) {
    cols = 2
    rows = 2
  } else if (count <= 6) {
    cols = 3
    rows = 2
  } else {
    cols = 3
    rows = 3
  }

  // Calculate individual image dimensions
  const imgWidth = Math.floor((width - gap * (cols + 1)) / cols)
  const imgHeight = Math.floor((height - gap * (rows + 1)) / rows)

  console.log(`Grid: ${cols}x${rows}, each image: ${imgWidth}x${imgHeight}`)

  // Resize all images first (in parallel but with error handling)
  const resizedImages = []
  for (let i = 0; i < Math.min(count, rows * cols); i++) {
    try {
      const buffer = base64ToBuffer(images[i].data)
      const resized = await sharp(buffer)
        .resize(imgWidth, imgHeight, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toBuffer()
      resizedImages.push(resized)
      console.log(`Resized image ${i + 1}/${count}`)
    } catch (error) {
      console.error(`Error resizing image ${i}:`, error.message)
      throw error
    }
  }

  // Create base canvas
  const canvas = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 20, g: 20, b: 20, alpha: 1 },
    },
  })
    .png()
    .toBuffer()

  // Prepare composite array
  const composites = []
  for (let i = 0; i < resizedImages.length; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols

    const x = gap + col * (imgWidth + gap)
    const y = gap + row * (imgHeight + gap)

    composites.push({
      input: resizedImages[i],
      top: y,
      left: x,
    })
  }

  console.log(`Compositing ${composites.length} images...`)

  // Composite all images onto canvas
  const result = await sharp(canvas).composite(composites).png().toBuffer()

  console.log('Grid layout complete')

  return result
}

/**
 * Create a collage layout composite
 */
const createCollageLayout = async (images, width, height) => {
  const count = images.length
  const gap = 15

  console.log(`Creating collage layout with ${count} images`)

  // Resize images first
  const resizedImages = []

  if (count === 2) {
    // Two images side by side
    const imgWidth = Math.floor((width - gap * 3) / 2)
    const imgHeight = height - gap * 2

    for (let i = 0; i < 2; i++) {
      const buffer = base64ToBuffer(images[i].data)
      const resized = await sharp(buffer)
        .resize(imgWidth, imgHeight, { fit: 'cover' })
        .png()
        .toBuffer()
      resizedImages.push({
        buffer: resized,
        layout: { imgWidth, imgHeight, i },
      })
    }
  } else if (count === 3) {
    // One large on left, two stacked on right
    const largeWidth = Math.floor((width - gap * 3) * 0.6)
    const smallWidth = width - largeWidth - gap * 3
    const largeHeight = height - gap * 2
    const smallHeight = Math.floor((height - gap * 3) / 2)

    // Large image
    const buffer0 = base64ToBuffer(images[0].data)
    const large = await sharp(buffer0)
      .resize(largeWidth, largeHeight, { fit: 'cover' })
      .png()
      .toBuffer()
    resizedImages.push({ buffer: large, isLarge: true })

    // Two small images
    for (let i = 1; i < 3; i++) {
      const buffer = base64ToBuffer(images[i].data)
      const small = await sharp(buffer)
        .resize(smallWidth, smallHeight, { fit: 'cover' })
        .png()
        .toBuffer()
      resizedImages.push({ buffer: small, isSmall: true, index: i - 1 })
    }
  } else {
    // Complex collage: 2 large, rest small
    const largeWidth = Math.floor((width - gap * 3) / 2)
    const largeHeight = Math.floor((height - gap * 3) * 0.6)
    const smallWidth = Math.floor((width - gap * 4) / 3)
    const smallHeight = height - largeHeight - gap * 3

    // Two large images
    for (let i = 0; i < Math.min(2, count); i++) {
      const buffer = base64ToBuffer(images[i].data)
      const large = await sharp(buffer)
        .resize(largeWidth, largeHeight, { fit: 'cover' })
        .png()
        .toBuffer()
      resizedImages.push({ buffer: large, isTop: true, index: i })
    }

    // Small images
    for (let i = 2; i < Math.min(5, count); i++) {
      const buffer = base64ToBuffer(images[i].data)
      const small = await sharp(buffer)
        .resize(smallWidth, smallHeight, { fit: 'cover' })
        .png()
        .toBuffer()
      resizedImages.push({ buffer: small, isBottom: true, index: i - 2 })
    }
  }

  // Create canvas
  const canvas = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 20, g: 20, b: 20, alpha: 1 },
    },
  })
    .png()
    .toBuffer()

  // Build composites array based on layout
  const composites = []

  if (count === 2) {
    const imgWidth = Math.floor((width - gap * 3) / 2)
    resizedImages.forEach((img, i) => {
      composites.push({
        input: img.buffer,
        top: gap,
        left: gap + i * (imgWidth + gap),
      })
    })
  } else if (count === 3) {
    const largeWidth = Math.floor((width - gap * 3) * 0.6)
    const smallHeight = Math.floor((height - gap * 3) / 2)

    resizedImages.forEach((img, i) => {
      if (img.isLarge) {
        composites.push({ input: img.buffer, top: gap, left: gap })
      } else {
        composites.push({
          input: img.buffer,
          top: gap + img.index * (smallHeight + gap),
          left: largeWidth + gap * 2,
        })
      }
    })
  } else {
    const largeWidth = Math.floor((width - gap * 3) / 2)
    const largeHeight = Math.floor((height - gap * 3) * 0.6)
    const smallWidth = Math.floor((width - gap * 4) / 3)

    resizedImages.forEach((img) => {
      if (img.isTop) {
        composites.push({
          input: img.buffer,
          top: gap,
          left: gap + img.index * (largeWidth + gap),
        })
      } else if (img.isBottom) {
        composites.push({
          input: img.buffer,
          top: largeHeight + gap * 2,
          left: gap + img.index * (smallWidth + gap),
        })
      }
    })
  }

  console.log(`Compositing ${composites.length} images for collage...`)

  const result = await sharp(canvas).composite(composites).png().toBuffer()

  console.log('Collage layout complete')

  return result
}

/**
 * Get image regions for click detection
 */
export const getImageRegions = (layout, imageCount, width, height) => {
  const regions = []

  if (layout === 'single') {
    regions.push({
      index: 0,
      x: 0,
      y: 0,
      width: width,
      height: height,
    })
    return regions
  }

  if (layout === 'grid') {
    const gap = 20
    let cols, rows

    if (imageCount <= 2) {
      cols = imageCount
      rows = 1
    } else if (imageCount <= 4) {
      cols = 2
      rows = 2
    } else if (imageCount <= 6) {
      cols = 3
      rows = 2
    } else {
      cols = 3
      rows = 3
    }

    const imgWidth = Math.floor((width - gap * (cols + 1)) / cols)
    const imgHeight = Math.floor((height - gap * (rows + 1)) / rows)

    for (let i = 0; i < Math.min(imageCount, rows * cols); i++) {
      const row = Math.floor(i / cols)
      const col = i % cols

      regions.push({
        index: i,
        x: gap + col * (imgWidth + gap),
        y: gap + row * (imgHeight + gap),
        width: imgWidth,
        height: imgHeight,
      })
    }
  } else if (layout === 'collage') {
    const gap = 15

    if (imageCount === 2) {
      const imgWidth = Math.floor((width - gap * 3) / 2)
      const imgHeight = height - gap * 2

      for (let i = 0; i < 2; i++) {
        regions.push({
          index: i,
          x: gap + i * (imgWidth + gap),
          y: gap,
          width: imgWidth,
          height: imgHeight,
        })
      }
    } else if (imageCount === 3) {
      const largeWidth = Math.floor((width - gap * 3) * 0.6)
      const smallWidth = width - largeWidth - gap * 3
      const largeHeight = height - gap * 2
      const smallHeight = Math.floor((height - gap * 3) / 2)

      regions.push({
        index: 0,
        x: gap,
        y: gap,
        width: largeWidth,
        height: largeHeight,
      })
      regions.push({
        index: 1,
        x: largeWidth + gap * 2,
        y: gap,
        width: smallWidth,
        height: smallHeight,
      })
      regions.push({
        index: 2,
        x: largeWidth + gap * 2,
        y: gap + smallHeight + gap,
        width: smallWidth,
        height: smallHeight,
      })
    } else {
      const largeWidth = Math.floor((width - gap * 3) / 2)
      const largeHeight = Math.floor((height - gap * 3) * 0.6)
      const smallWidth = Math.floor((width - gap * 4) / 3)
      const smallHeight = height - largeHeight - gap * 3

      // Top row (2 large)
      for (let i = 0; i < Math.min(2, imageCount); i++) {
        regions.push({
          index: i,
          x: gap + i * (largeWidth + gap),
          y: gap,
          width: largeWidth,
          height: largeHeight,
        })
      }

      // Bottom row (3 small)
      for (let i = 2; i < Math.min(5, imageCount); i++) {
        regions.push({
          index: i,
          x: gap + (i - 2) * (smallWidth + gap),
          y: largeHeight + gap * 2,
          width: smallWidth,
          height: smallHeight,
        })
      }
    }
  }

  return regions
}
