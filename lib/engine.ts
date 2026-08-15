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

export const SUPPORTED_CITIES: CityOption[] = [
  // Nigerian Cities
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Abuja', country: 'Nigeria', lat: 9.0765, lon: 7.3986 },
  { name: 'Port Harcourt', country: 'Nigeria', lat: 4.8156, lon: 7.0498 },
  { name: 'Enugu', country: 'Nigeria', lat: 6.4584, lon: 7.5464 },
  { name: 'Ibadan', country: 'Nigeria', lat: 7.3775, lon: 3.9470 },
  { name: 'Kano', country: 'Nigeria', lat: 12.0022, lon: 8.5920 },
  // International Cities
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
  { name: 'Atlanta', country: 'USA', lat: 33.7490, lon: -84.3880 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219 },
];

export const EVENT_TYPES = [
  'Traditional Wedding / Owambe',
  'White Wedding / Reception',
  'Black Tie Gala & Red Carpet',
  'Corporate Tech & Executive Summit',
  'Outdoor Festival / Concert',
  'Dinner Date / Cocktail Evening',
];

export interface EventPlanResponse {
  routine: RoutineDay[];
  vtoGarmentSuggestions: { id: string; name: string; url: string; category: string; matchReason: string }[];
}

export function generateEventPlan(
  skin: SkinAnalysisResult,
  env: EnvironmentalData,
  eventType: string
): EventPlanResponse {
  const isHighUV = env.uvIndexMax >= 6;
  const isHumid = env.tempMaxC >= 28;

  // 1. 7-Day Skincare Routine Optimized for Melanin-Rich Skin & UV Protection
  const routine: RoutineDay[] = [
    {
      day: 7,
      title: 'Gentle Cell Renewal & Clarify',
      focus: 'Prevent congestion & even tone without triggering PIH (hyperpigmentation)',
      actionItems: [
        'Use gentle Mandelic Acid or LHA (avoids hyperpigmentation on melanin-rich skin)',
        'Hydrate with a ceramide-rich barrier cream',
      ],
    },
    {
      day: 5,
      title: 'Deep Hydration & Glow Layering',
      focus: 'Plump the skin to build a dewy, non-greasy natural radiance',
      actionItems: [
        'Apply Hyaluronic Acid + Polyglutamic Acid serum on damp skin',
        'Use an antioxidant green tea or rose water mist',
      ],
    },
    {
      day: 3,
      title: 'Even Tone & Melanin Protection',
      focus: 'Calm active redness, dark circles, and pigmentation',
      actionItems: [
        'Apply 3% Tranexamic Acid or Niacinamide serum',
        'Soothe under-eyes with a caffeine-infused cooling eye treatment',
      ],
    },
    {
      day: 1,
      title: 'Pre-Event Moisture Lock',
      focus: 'Barrier sealing for long-lasting makeup application',
      actionItems: [
        'Overnight peptide & lipid mask for bouncy skin',
        'Drink at least 2.5L water to maintain systemic hydration',
      ],
    },
    {
      day: 0,
      title: 'Event Day Prep & Climate Shield',
      focus: isHumid ? 'Oil control & invisible UV shield' : 'Dewy finish & barrier defense',
      actionItems: [
        isHighUV
          ? 'Apply chemical invisible sunscreen SPF 50+ (Zero white cast on dark skin)'
          : 'Apply lightweight broad spectrum SPF 30+',
        isHumid
          ? 'Apply a mattifying, niacinamide-infused primer to T-zone before makeup/garment fitting'
          : 'Apply a radiant hydrating base primer',
      ],
    },
  ];

  // 2. Garment Recommendations tailored to Event & Rich Skin Undertones
  const vtoGarmentSuggestions = [
    {
      id: 'g1',
      name: `${eventType} Emerald Luxe Ensemble`,
      url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
      category: 'dresses',
      matchReason: 'Vibrant jewel tones pop strikingly against warm and deep skin undertones.',
    },
    {
      id: 'g2',
      name: `${eventType} Regal Champagne & Bronze Gown`,
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
      category: 'dresses',
      matchReason: 'Metallic bronze and warm champagne enhance melanin radiance under event lighting.',
    },
    {
      id: 'g3',
      name: `${eventType} Rose Brown & Coral Silk Asoebi`,
      url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
      category: 'dresses',
      matchReason: 'Harmonious earthy rose undertones deliver a soft, cohesive luxury aesthetic.',
    },
  ];

  return { routine, vtoGarmentSuggestions };
}