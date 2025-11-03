// File: client/src/components/Moodboard/Moodboardconfig.js (FIXED - Enum Aligned)
// IMPORTANT: Every value here MUST match the backend model enums

export const getColorDescriptionForPalette = (paletteName) => {
  const colorDescriptions = {
    'Executive Navy':
      'professional navy blue with crisp whites and deep accents',
    'Corporate Gray': 'minimalist corporate grays and blacks',
    'Business Black': 'modern sleek black, white and gray palette',
    'Neutral Tones': 'warm beige, taupe, brown, and cream tones',
    'Warm Earth': 'warm terracotta, gold, brown, and cream',
    'Terracotta Vibes': 'earthy terracotta, rust, and warm browns',
    'Sand & Stone': 'natural sand, stone, and beige tones',
    'Cool Blues': 'calm cool blues with white and light accents',
    'Ocean Breeze': 'fresh cyan, turquoise, and aqua blues',
    'Sky Blue': 'light sky blue and white palette',
    'Slate Gray': 'cool slate gray and dark gray tones',
    'Natural Green': 'fresh natural greens with white',
    'Forest Green': 'deep forest and dark greens',
    'Sage Green': 'calm sage and muted green tones',
    'Olive Tones': 'earthy olive, brown, and muted tones',
    'Pure Monochrome': 'pure black, white, and gray monochrome',
    'Soft Grays': 'soft gray palette with minimal accents',
    'Charcoal Minimal': 'charcoal and light gray minimal palette',
    'Vibrant Accents': 'bold red accents with neutral base',
    'Sunset Orange': 'warm orange, gold, and sunset tones',
    'Deep Purple': 'luxurious deep purple and magenta',
    'Teal Accent': 'fresh teal and turquoise accents',
    'Pastel Palette': 'soft pastel pink and light tones',
    'Blush Pink': 'gentle blush pink and warm tones',
    'Lavender Dream': 'soft lavender and light purple',
    'Peach Cream': 'warm peach, cream, and gold tones',
    'Deep & Rich': 'deep purple, dark accents, luxurious',
    'Burgundy Luxury': 'rich burgundy and wine tones',
    'Gold & Cream': 'luxurious gold with cream and warm whites',
    'Warm Whites': 'bright warm whites with gold accents',
    'Cream & Ivory': 'classic cream and ivory with gold',
    'Soft White': 'clean soft whites with warm undertones',
    'Beige Elegance': 'sophisticated beige and warm brown tones',
  }
  return colorDescriptions[paletteName] || 'modern neutral tones'
}

// Color palettes for interior design
export const COLOR_PALETTES = [
  // Professional & Corporate
  {
    name: 'Executive Navy',
    colors: ['#F8F9FA', '#E3F2FD', '#1565C0', '#0D47A1', '#051D54'],
    description: 'Professional & authoritative',
  },
  {
    name: 'Corporate Gray',
    colors: ['#FFFFFF', '#F5F5F5', '#BDBDBD', '#616161', '#212121'],
    description: 'Minimalist corporate',
  },
  {
    name: 'Business Black',
    colors: ['#FAFAFA', '#E0E0E0', '#757575', '#424242', '#000000'],
    description: 'Modern & sleek',
  },

  // Warm & Welcoming
  {
    name: 'Neutral Tones',
    colors: ['#F5F1E8', '#D4CFBE', '#9B9276', '#6B6B5B', '#3D3D2E'],
    description: 'Timeless & sophisticated',
  },
  {
    name: 'Warm Earth',
    colors: ['#FFF4E6', '#FFD4A3', '#D4A574', '#B8860B', '#8B4513'],
    description: 'Cozy & grounding',
  },
  {
    name: 'Terracotta Vibes',
    colors: ['#FFE8D6', '#FFB88C', '#D2691E', '#A0522D', '#704214'],
    description: 'Warm & earthy',
  },
  {
    name: 'Sand & Stone',
    colors: ['#FFF8DC', '#F5DEB3', '#D2B48C', '#A3826D', '#6B5C47'],
    description: 'Natural & calm',
  },

  // Cool & Serene
  {
    name: 'Cool Blues',
    colors: ['#E8F4F8', '#B3D9E6', '#6BA3BF', '#4682B4', '#1E3A8A'],
    description: 'Calm & serene',
  },
  {
    name: 'Ocean Breeze',
    colors: ['#E0F2F1', '#80DEEA', '#4DD0E1', '#26C6DA', '#0097A7'],
    description: 'Fresh & airy',
  },
  {
    name: 'Sky Blue',
    colors: ['#E3F2FD', '#BBDEFB', '#64B5F6', '#42A5F5', '#2196F3'],
    description: 'Light & uplifting',
  },
  {
    name: 'Slate Gray',
    colors: ['#ECEFF1', '#CFD8DC', '#90A4AE', '#607D8B', '#37474F'],
    description: 'Cool & modern',
  },

  // Green & Natural
  {
    name: 'Natural Green',
    colors: ['#F0F8F0', '#C8E6C9', '#81C784', '#4CAF50', '#2E7D32'],
    description: 'Fresh & organic',
  },
  {
    name: 'Forest Green',
    colors: ['#E8F5E9', '#A5D6A7', '#66BB6A', '#43A047', '#1B5E20'],
    description: 'Deep & natural',
  },
  {
    name: 'Sage Green',
    colors: ['#F1F8F6', '#B2DFDB', '#80CBC4', '#4DB6AC', '#00796B'],
    description: 'Calm & peaceful',
  },
  {
    name: 'Olive Tones',
    colors: ['#F4F3EE', '#D7CCC8', '#A1887F', '#795548', '#4E342E'],
    description: 'Earthy & balanced',
  },

  // Monochrome & Minimalist
  {
    name: 'Pure Monochrome',
    colors: ['#FFFFFF', '#E0E0E0', '#999999', '#4D4D4D', '#000000'],
    description: 'Sleek & modern',
  },
  {
    name: 'Soft Grays',
    colors: ['#FAFAFA', '#E8E8E8', '#BDBDBD', '#808080', '#424242'],
    description: 'Minimal & elegant',
  },
  {
    name: 'Charcoal Minimal',
    colors: ['#F7F7F7', '#E0E0E0', '#9E9E9E', '#616161', '#2C2C2C'],
    description: 'Contemporary neutral',
  },

  // Vibrant & Bold
  {
    name: 'Vibrant Accents',
    colors: ['#FFE5E0', '#FFB3A3', '#FF6B6B', '#FF3333', '#CC0000'],
    description: 'Bold & energetic',
  },
  {
    name: 'Sunset Orange',
    colors: ['#FFF3E0', '#FFE0B2', '#FFB74D', '#FFA726', '#E65100'],
    description: 'Warm & dynamic',
  },
  {
    name: 'Deep Purple',
    colors: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#6A1B9A'],
    description: 'Luxurious & bold',
  },
  {
    name: 'Teal Accent',
    colors: ['#E0F2F1', '#B2DFDB', '#80CBC4', '#26A69A', '#00695C'],
    description: 'Fresh & modern',
  },

  // Soft & Romantic
  {
    name: 'Pastel Palette',
    colors: ['#FFF0F5', '#FFB3D9', '#FF99CC', '#FF66B3', '#FF3399'],
    description: 'Soft & romantic',
  },
  {
    name: 'Blush Pink',
    colors: ['#FCE4EC', '#F8BBD0', '#F48FB1', '#F06292', '#C2185B'],
    description: 'Gentle & warm',
  },
  {
    name: 'Lavender Dream',
    colors: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#8E24AA'],
    description: 'Soft & serene',
  },
  {
    name: 'Peach Cream',
    colors: ['#FFEAA7', '#FDCB6E', '#F39C12', '#E67E22', '#D35400'],
    description: 'Warm & inviting',
  },

  // Luxury & Rich
  {
    name: 'Deep & Rich',
    colors: ['#2D1B4E', '#4A235A', '#6C3483', '#8E44AD', '#AF7AC5'],
    description: 'Luxurious & dramatic',
  },
  {
    name: 'Burgundy Luxury',
    colors: ['#4A0E0E', '#6B1414', '#8B2121', '#A64D4D', '#C07070'],
    description: 'Rich & elegant',
  },
  {
    name: 'Gold & Cream',
    colors: ['#FFF9E6', '#FFE680', '#FFD700', '#DAA520', '#B8860B'],
    description: 'Luxurious & warm',
  },

  // Warm Whites
  {
    name: 'Warm Whites',
    colors: ['#FFFEF0', '#FFFACD', '#FFE4B5', '#FFD700', '#FFA500'],
    description: 'Bright & welcoming',
  },
  {
    name: 'Cream & Ivory',
    colors: ['#FFFFF0', '#FFFACD', '#F0E68C', '#EEE8AA', '#DAA520'],
    description: 'Classic & timeless',
  },
  {
    name: 'Soft White',
    colors: ['#FFFFFF', '#FFF8F3', '#FFE4D4', '#F5DEB3', '#DEB887'],
    description: 'Clean & bright',
  },
  {
    name: 'Beige Elegance',
    colors: ['#F5F5DC', '#F0E68C', '#E6D5B5', '#D4A574', '#C19A6B'],
    description: 'Sophisticated & warm',
  },
]

// ============================================================================
// ROOM TYPES - MUST MATCH Moodboard.roomType enum
// ============================================================================
export const SPACE_TYPES = [
  {
    name: 'Living Room',
    icon: 'Sofa',
    value: 'living_room', // ✅ Matches model
    description: 'Social gathering space',
  },
  {
    name: 'Bedroom',
    icon: 'Home',
    value: 'bedroom', // ✅ Matches model
    description: 'Rest & relaxation',
  },
  {
    name: 'Kitchen',
    icon: 'ChefHat',
    value: 'kitchen', // ✅ Matches model
    description: 'Culinary hub',
  },
  {
    name: 'Dining Room',
    icon: 'Utensils',
    value: 'dining_room', // ✅ Matches model
    description: 'Dining & entertaining',
  },
  {
    name: 'Office',
    icon: 'Layers',
    value: 'office', // ✅ Matches model
    description: 'Productivity zone',
  },
  {
    name: 'Bathroom',
    icon: 'Lightbulb',
    value: 'bathroom', // ✅ Matches model
    description: 'Personal spa',
  },
  {
    name: 'Home Office',
    icon: 'Heart',
    value: 'home_office', // ✅ Matches model
    description: 'Work from home',
  },
  {
    name: 'Balcony',
    icon: 'Globe',
    value: 'outdoor', // ✅ Matches model
    description: 'Outdoor living',
  },
  {
    name: 'Hallway',
    icon: 'Heart',
    value: 'hallway', // ✅ Matches model
    description: 'Entry & corridors',
  },
  {
    name: 'Kids Room',
    icon: 'Heart',
    value: 'kids_room', // ✅ Matches model
    description: 'Fun & playful',
  },
  {
    name: 'Commercial Space',
    icon: 'Layers',
    value: 'commercial', // ✅ Matches model
    description: 'Retail & business',
  },
  {
    name: 'Restaurant',
    icon: 'ChefHat',
    value: 'restaurant', // ✅ Matches model
    description: 'Dining establishment',
  },
  {
    name: 'Other',
    icon: 'Layers',
    value: 'other', // ✅ Matches model (fallback)
    description: 'Custom space',
  },
]

// ============================================================================
// DESIGN STYLES - MUST MATCH Moodboard.style enum EXACTLY
// ============================================================================
// ENUM in model: 'modern', 'contemporary', 'minimalist', 'scandinavian',
// 'industrial', 'bohemian', 'traditional', 'rustic', 'coastal', 'eclectic',
// 'mid-century', 'luxury', 'art-deco', 'mediterranean', 'japanese',
// 'industrial-chic', 'transitional', 'custom'
export const DESIGN_STYLES = [
  // Core styles
  {
    label: 'Modern',
    value: 'modern', // ✅ Matches model - previously missing!
    description: 'Clean & contemporary',
  },
  {
    label: 'Contemporary',
    value: 'contemporary', // ✅ Matches model
    description: 'Trendy & refined',
  },
  {
    label: 'Modern Minimalist',
    value: 'minimalist', // ✅ Matches model
    description: 'Clean & simple',
  },

  // Natural & Organic
  {
    label: 'Scandinavian',
    value: 'scandinavian', // ✅ Matches model
    description: 'Cozy & functional',
  },
  {
    label: 'Rustic',
    value: 'rustic', // ✅ Matches model
    description: 'Warm & natural',
  },
  {
    label: 'Coastal',
    value: 'coastal', // ✅ Matches model
    description: 'Relaxed & beachy',
  },

  // Artistic & Expressive
  {
    label: 'Bohemian',
    value: 'bohemian', // ✅ Matches model
    description: 'Eclectic & artistic',
  },
  {
    label: 'Eclectic',
    value: 'eclectic', // ✅ Matches model - previously missing!
    description: 'Mixed & vibrant',
  },

  // Industrial & Urban
  {
    label: 'Industrial',
    value: 'industrial', // ✅ Matches model
    description: 'Raw & edgy',
  },
  {
    label: 'Industrial Chic',
    value: 'industrial-chic', // ✅ Matches model
    description: 'Urban & trendy',
  },

  // Classical & Elegant
  {
    label: 'Traditional',
    value: 'traditional', // ✅ Matches model
    description: 'Classic & timeless',
  },
  {
    label: 'Transitional',
    value: 'transitional', // ✅ Matches model
    description: 'Balanced & versatile',
  },

  // Global Influences
  {
    label: 'Mediterranean',
    value: 'mediterranean', // ✅ Matches model
    description: 'Warm & textured',
  },
  {
    label: 'Japanese',
    value: 'japanese', // ✅ Matches model
    description: 'Zen & minimalist',
  },

  // Luxury & Glamorous
  {
    label: 'Luxury',
    value: 'luxury', // ✅ Matches model
    description: 'Opulent & bold',
  },
  {
    label: 'Art Deco',
    value: 'art-deco', // ✅ Matches model
    description: 'Geometric & glamorous',
  },

  // Fallback
  {
    label: 'Custom',
    value: 'custom', // ✅ Matches model - previously missing!
    description: 'Your unique vision',
  },
]

// Aspect ratios
export const ASPECT_RATIOS = [
  { label: 'Landscape (16:9)', value: '16:9' },
  { label: 'Wide (21:9)', value: '21:9' },
  { label: 'Classic (4:3)', value: '4:3' },
  { label: 'Square (1:1)', value: '1:1' },
]

// Brand colors
export const BRAND_COLOR = '#937c60'
export const BRAND_COLOR_LIGHT = '#a68970'
export const BRAND_COLOR_DARK = '#6b5c50'

// Get all configuration
export const getMoodboardConfig = () => ({
  colors: COLOR_PALETTES,
  spaces: SPACE_TYPES,
  styles: DESIGN_STYLES,
  ratios: ASPECT_RATIOS,
})
