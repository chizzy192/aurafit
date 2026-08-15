// src/lib/engine.ts
import { SkinAnalysisResult } from './youcam/skin';
import { EnvironmentalData } from './weather';

export interface RoutineDay {
  day: number;
  title: string;
  focus: string;
  actionItems: string[];
}

export interface CityOption {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Garment {
  id: string;
  name: string;
  category: 'full_body' | 'upper_body' | 'lower_body';
  url: string;
  tag: string;
  matchReason: string;
}

export const SUPPORTED_CITIES: CityOption[] = [
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Abuja', country: 'Nigeria', lat: 9.0765, lon: 7.3986 },
  { name: 'Port Harcourt', country: 'Nigeria', lat: 4.8156, lon: 7.0498 },
  { name: 'Enugu', country: 'Nigeria', lat: 6.4584, lon: 7.5464 },
  { name: 'Ibadan', country: 'Nigeria', lat: 7.3775, lon: 3.9470 },
  { name: 'Kano', country: 'Nigeria', lat: 12.0022, lon: 8.5920 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
  { name: 'Atlanta', country: 'USA', lat: 33.7490, lon: -84.3880 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473 },
];

// EVENT_TYPES is the single source of truth for event options — the demo form,
// the wardrobe catalog keys, and any select dropdowns must all reference this
// array rather than hardcoding their own copies. A mismatched string here is
// what silently breaks garment matching (falls back to the default wardrobe
// with no visible error), so keep every consumer importing from here.
export const EVENT_TYPES = [
  'Traditional Wedding / Owambe',
  'White Wedding / Reception',
  'Black Tie Gala & Red Carpet',
  'Corporate Tech & Executive Summit',
  'Outdoor Summer Festival',
  'Evening Cocktail & Dinner',
];

// Verified YouCam-compatible garment assets
// src/lib/engine.ts

export type GarmentFitType = 'full_body' | 'upper_body' | 'lower_body' | 'headwear' | 'shoes';

export interface Garment {
  id: string;
  name: string;
  category: GarmentFitType;
  url: string;
  tag: string;
  matchReason: string;
}

export const WARDROBE_CATALOG: Record<string, Garment[]> = {
  'Traditional Wedding / Owambe': [
    // Full Body Fits
    {
      id: 'ow-fb-1',
      name: 'Emerald Luxe Corseted Asoebi Gown',
      category: 'full_body',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_full_body_05_6364e97f94.png',
      tag: 'Full Body Asoebi',
      matchReason: 'Vibrant emerald satin structured gown highlighting waist and silhouette.',
    },
    {
      id: 'ow-fb-2',
      name: 'Regal Terracotta & Gold Brocade Ensemble',
      category: 'full_body',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_full_body_01_a931e9c5e3.png',
      tag: 'Full Body Brocade',
      matchReason: 'Rich warm undertones popping under Nigerian event sunlight.',
    },
    // Upper Body
    {
      id: 'ow-ub-1',
      name: 'Embroidered Coral Peplum Lace Blouse',
      category: 'upper_body',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_upper_body_01_7e1b57d079.png',
      tag: 'Upper Body Lace',
      matchReason: 'Intricate lace detailing tailored for statement jewelry pairings.',
    },
    // Lower Body
    {
      id: 'ow-lb-1',
      name: 'Mermaid Silk Wrapper & Skirt',
      category: 'lower_body',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_lower_body_01_25bf8c4b72.png',
      tag: 'Lower Body Skirt',
      matchReason: 'Flowing hemline designed to balance high-waisted traditional tops.',
    },
    // Headwear (Gele / Fascinator)
    {
      id: 'ow-hw-1',
      name: 'Auto-Gele Statement Crown (Champagne Gold)',
      category: 'headwear',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_full_body_02_e0467c6da9.png',
      tag: 'Traditional Gele',
      matchReason: 'Architectural pleated gele framing facial structure and earrings.',
    },
    // Footwear
    {
      id: 'ow-sh-1',
      name: 'Metallic Bronze Strappy Stilettos',
      category: 'shoes',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_full_body_05_6364e97f94.png',
      tag: 'Luxury Footwear',
      matchReason: 'Complementary ankle-lengthening heel for floor-length gowns.',
    },
  ],
  'Black Tie Gala & Red Carpet': [
    {
      id: 'gala-fb-1',
      name: 'Midnight Velvet Column Gown',
      category: 'full_body',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_full_body_05_6364e97f94.png',
      tag: 'Full Body Velvet',
      matchReason: 'High drama evening silhouette with clean contour lines.',
    },
    {
      id: 'gala-ub-1',
      name: 'Structured Tuxedo Blazer in Rose Mocha',
      category: 'upper_body',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_upper_body_01_7e1b57d079.png',
      tag: 'Upper Body Blazer',
      matchReason: 'Modern androgynous tailoring for red-carpet impact.',
    },
    {
      id: 'gala-hw-1',
      name: 'Wide-Brim Wool Felt Fedora & Fascinator',
      category: 'headwear',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_full_body_02_e0467c6da9.png',
      tag: 'Gala Headwear',
      matchReason: 'Dramatic sculptural accessory adding height and vintage elegance.',
    },
  ],
  'Corporate Tech & Executive Summit': [
    {
      id: 'corp-fb-1',
      name: 'Tailored Mocha Executive Trouser Suit',
      category: 'full_body',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_full_body_02_e0467c6da9.png',
      tag: 'Full Body Suit',
      matchReason: 'Power tailoring in warm earth tones for commanding presence.',
    },
    {
      id: 'corp-ub-1',
      name: 'Minimal Silk Mandarin-Collar Shirt',
      category: 'upper_body',
      url: 'https://plugins-media.makeupar.com/strapi/assets/clothes_reference_upper_body_01_7e1b57d079.png',
      tag: 'Upper Body Silk',
      matchReason: 'Clean lines creating an effortless business silhouette.',
    },
  ],
};

export interface EventPlanResponse {
  routine: RoutineDay[];
  vtoGarmentSuggestions: Garment[];
}

export function generateEventPlan(
  skin: SkinAnalysisResult,
  env: EnvironmentalData,
  eventType: string
): EventPlanResponse {
  // Pull every raw number once, up front, so the routine copy below can cite
  // the exact figure that triggered each decision instead of paraphrasing it.
  const hydration = skin.metrics.hydration ?? 50;
  const redness = skin.metrics.redness ?? 30;
  const darkCircles = skin.metrics.dark_circles ?? 30;
  const uvIndex = env.uvIndexMax;
  const tempMax = env.tempMaxC;

  const isHighUV = uvIndex >= 6;
  const isHumid = tempMax >= 28;
  const isDehydrated = hydration < 55;
  const hasHighRedness = redness > 35;
  const hasDarkCircles = darkCircles > 35;

  // 1. Fully Dynamic 7-Day Skincare Routine responding to real diagnostics
  const routine: RoutineDay[] = [
    {
      day: 7,
      title: 'Gentle Resurfacing & Barrier Prep',
      focus: isDehydrated
        ? `Enzyme-based dead cell removal without stripping moisture — hydration scored ${hydration}/100, below the 55 threshold for active exfoliants`
        : `Even texture and clarify pores without post-inflammatory hyperpigmentation — hydration at ${hydration}/100 supports a stronger exfoliant`,
      actionItems: [
        isDehydrated
          ? 'Use PHA / Mandelic acid serum (ultra-gentle for dry/melanin-rich skin)'
          : 'Apply 2% BHA salicylic solution targeting congestion',
        'Apply ceramide barrier restorer at night',
      ],
    },
    {
      day: 5,
      title: 'Targeted Correction & Hydration Infusion',
      focus: hasDarkCircles
        ? `Periorbital brightening & cellular plumping — dark circle score ${darkCircles}/100 flagged above the 35 threshold`
        : 'Multi-depth skin hydration layer',
      actionItems: [
        'Apply dual-molecular Hyaluronic Acid on damp skin',
        hasDarkCircles
          ? `Layer Caffeine 5% + EGCG serum under the eyes to depuff (dark circle score ${darkCircles}/100)`
          : 'Apply Polyglutamic Acid serum for a glass-skin finish',
      ],
    },
    {
      day: 3,
      title: 'Tone Calibration & Calming',
      focus: hasHighRedness
        ? `Soothe inflammation and redness flare-ups — redness score ${redness}/100 flagged above the 35 threshold`
        : 'Fade dark spots and stabilize melanin activity',
      actionItems: [
        hasHighRedness
          ? `Use Centella Asiatica (Cica) + 3% Niacinamide to calm redness (score ${redness}/100)`
          : 'Apply 3% Tranexamic Acid serum to brighten dark spots',
        'Avoid physical scrubs or harsh active acids from this point forward',
      ],
    },
    {
      day: 1,
      title: 'Pre-Event Moisture Seal',
      focus: 'Lock in moisture to guarantee seamless, non-patchy makeup wear',
      actionItems: [
        'Apply an overnight peptide & lipid sleeping pack',
        'Hydrate systemically with at least 2.5L of water throughout the day',
      ],
    },
    {
      day: 0,
      title: 'Event Day Shield & Primer Base',
      focus: isHighUV
        ? `Extreme UV Defense (UV Index ${uvIndex}) & Climate Shield`
        : `All-Day Radiance & Moisture Grip (UV Index ${uvIndex} — standard exposure)`,
      actionItems: [
        isHighUV
          ? `Apply Invisible Chemical Sunscreen SPF 50+ (Zero white cast on dark skin) — UV index ${uvIndex} demands reapplication by early afternoon`
          : 'Apply Broad Spectrum SPF 30+ antioxidant sunscreen',
        isHumid
          ? `Use an oil-control, niacinamide mattifying primer on the T-Zone — forecast high of ${tempMax}°C drives midday shine`
          : 'Apply a dewy, hydrating primer to seal base glow',
      ],
    },
  ];

  // 2. Select matching wardrobe for this specific event type.
  // Falls back to Owambe only if eventType truly doesn't match any catalog
  // key — this should never fire silently now that EventForm imports its
  // options directly from EVENT_TYPES above.
  const vtoGarmentSuggestions =
    WARDROBE_CATALOG[eventType] ||
    WARDROBE_CATALOG['Traditional Wedding / Owambe'];

  return { routine, vtoGarmentSuggestions };
}