// src/lib/colors.ts

export interface ColorSwatch {
  hex: string;
  name: string;
  rgb: string;
  contrastTextColor: '#FFFFFF' | '#2D1812';
}

// Curated palettes ranging from soft blush pink to deep earthy mocha & jewel tones
const COMPREHENSIVE_PALETTES: Record<string, string[]> = {
  warm: ['#C68B7B', '#A85A48', '#E28743', '#DDA7A5', '#633B31'],     // Terracotta, Rose Brown, Rich Amber, Espresso
  cool: ['#B76E79', '#4A6B82', '#735D78', '#2E4057', '#E0AFA0'],     // Rose Gold, Royal Slate, Deep Plum, Midnight Teal
  neutral: ['#C68B7B', '#D4A373', '#A5A58D', '#8E5B50', '#2D1812'],  // Rose Brown, Warm Ochre, Sage, Espresso
};

export async function fetchColorDetails(hexCode: string): Promise<ColorSwatch> {
  const cleanHex = hexCode.replace('#', '');
  try {
    const res = await fetch(`https://www.thecolorapi.com/id?hex=${cleanHex}&format=json`);
    if (!res.ok) throw new Error('Color API unreachable');
    const data = await res.json();

    // Determine contrast text color based on luminance
    const r = data.rgb.r || 100;
    const g = data.rgb.g || 100;
    const b = data.rgb.b || 100;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const contrastTextColor = luminance > 0.55 ? '#2D1812' : '#FFFFFF';

    return {
      hex: data.hex.value || hexCode,
      name: data.name.value || 'Custom Hue',
      rgb: data.rgb.value || `rgb(${r}, ${g}, ${b})`,
      contrastTextColor,
    };
  } catch (error) {
    return {
      hex: hexCode,
      name: 'Curated Shade',
      rgb: 'rgb(198, 139, 123)',
      contrastTextColor: '#FFFFFF',
    };
  }
}

export async function getPaletteForUndertone(undertone: 'warm' | 'cool' | 'neutral'): Promise<ColorSwatch[]> {
  const hexList = COMPREHENSIVE_PALETTES[undertone] || COMPREHENSIVE_PALETTES.neutral;
  return await Promise.all(hexList.map((hex) => fetchColorDetails(hex)));
}