// File: server/services/exportService.js
export const exportToDXF = async (floorPlan) => {
  let dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1014
9
$INSBASE
10
0.0
20
0.0
30
0.0
9
$EXTMIN
10
0.0
20
0.0
30
0.0
9
$EXTMAX
10
1200.0
20
800.0
30
0.0
9
$LIMMIN
10
0.0
20
0.0
9
$LIMMAX
10
1200.0
20
800.0
9
$MEASUREMENT
70
1
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
5
2
100
AcDbSymbolTable
70
5
`

  // Add layers
  floorPlan.layers.forEach((layer) => {
    dxfContent += `0
LAYER
5
${layer.id + 10}
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
${layer.name}
70
0
62
7
6
Continuous
0
`
  })

  dxfContent += `0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`

  // Export elements
  floorPlan.elements.forEach((element, index) => {
    const layer = floorPlan.layers.find((l) => l.id === element.layer)
    const layerName = layer?.name || 'Layer1'

    if (element.type === 'wall') {
      dxfContent += `0
LINE
5
${100 + index}
100
AcDbEntity
8
${layerName}
100
AcDbLine
10
${element.startX || 0}
20
${element.startY || 0}
30
0
11
${element.endX || 0}
21
${element.endY || 0}
31
0
`
    } else if (element.type === 'room') {
      // Export room as closed polyline
      dxfContent += `0
LWPOLYLINE
5
${100 + index}
100
AcDbEntity
8
${layerName}
100
AcDbPolyline
90
4
70
1
43
0.0
10
${element.x || 0}
20
${element.y || 0}
10
${(element.x || 0) + (element.width || 0)}
20
${element.y || 0}
10
${(element.x || 0) + (element.width || 0)}
20
${(element.y || 0) + (element.height || 0)}
10
${element.x || 0}
20
${(element.y || 0) + (element.height || 0)}
`
    } else if (element.type === 'door') {
      // Export door as arc and line
      dxfContent += `0
INSERT
5
${100 + index}
100
AcDbEntity
8
${layerName}
100
AcDbBlockReference
2
DOOR
10
${element.x || 0}
20
${element.y || 0}
30
0
41
1.0
42
1.0
43
1.0
50
${element.rotation || 0}
`
    } else if (element.type === 'window') {
      // Export window as rectangle with lines
      dxfContent += `0
INSERT
5
${100 + index}
100
AcDbEntity
8
${layerName}
100
AcDbBlockReference
2
WINDOW
10
${element.x || 0}
20
${element.y || 0}
30
0
41
1.0
42
1.0
43
1.0
50
${element.rotation || 0}
`
    }
  })

  dxfContent += `0
ENDSEC
0
EOF`

  return Buffer.from(dxfContent)
}

export const exportToPDF = async (floorPlan) => {
  // This would use a library like pdfkit or puppeteer
  // For now, return a simple implementation
  const PDFDocument = (await import('pdfkit')).default
  const doc = new PDFDocument({
    size: 'A3',
    layout: 'landscape',
    margin: 50,
  })

  const chunks = []
  doc.on('data', (chunk) => chunks.push(chunk))

  // Add title
  doc.fontSize(20).text(`Floor Plan: ${floorPlan.name}`, 50, 50)
  doc.fontSize(12).text(`Created: ${new Date().toLocaleDateString()}`, 50, 80)
  doc
    .fontSize(10)
    .text(`Scale: 1:${floorPlan.scale} | Units: ${floorPlan.units}`, 50, 100)

  // Draw elements (simplified)
  doc.translate(50, 150)
  const scaleFactor = 0.5

  floorPlan.elements.forEach((element) => {
    if (element.type === 'wall') {
      doc
        .lineWidth(element.thickness * scaleFactor || 5)
        .moveTo(element.startX * scaleFactor, element.startY * scaleFactor)
        .lineTo(element.endX * scaleFactor, element.endY * scaleFactor)
        .stroke()
    } else if (element.type === 'room') {
      doc
        .rect(
          element.x * scaleFactor,
          element.y * scaleFactor,
          element.width * scaleFactor,
          element.height * scaleFactor
        )
        .stroke()
    }
  })

  doc.end()

  return Buffer.concat(chunks)
}

export const exportToPNG = async (floorPlan) => {
  // This would use a library like canvas or sharp
  // For now, return a placeholder implementation
  const { createCanvas } = await import('canvas')
  const canvas = createCanvas(1200, 800)
  const ctx = canvas.getContext('2d')

  // White background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 1200, 800)

  // Draw elements
  floorPlan.elements.forEach((element) => {
    if (element.type === 'wall') {
      ctx.strokeStyle = element.color || '#000000'
      ctx.lineWidth = element.thickness || 10
      ctx.beginPath()
      ctx.moveTo(element.startX, element.startY)
      ctx.lineTo(element.endX, element.endY)
      ctx.stroke()
    } else if (element.type === 'room') {
      ctx.strokeStyle = element.color || '#000000'
      ctx.lineWidth = 2
      ctx.strokeRect(element.x, element.y, element.width, element.height)
    } else if (element.type === 'door') {
      ctx.strokeStyle = element.color || '#947d61'
      ctx.lineWidth = 2
      ctx.strokeRect(element.x, element.y, element.width, element.height)

      // Draw swing arc
      ctx.beginPath()
      ctx.arc(
        element.x,
        element.y + element.height,
        element.width,
        -Math.PI / 2,
        0
      )
      ctx.stroke()
    } else if (element.type === 'window') {
      ctx.fillStyle = element.color + '40' || '#3b82f640'
      ctx.fillRect(element.x, element.y, element.width, element.height)
      ctx.strokeStyle = element.color || '#3b82f6'
      ctx.lineWidth = 2
      ctx.strokeRect(element.x, element.y, element.width, element.height)
    }
  })

  return canvas.toBuffer('image/png')
}
