import { SkinAnalysisResult } from './youcam/skin';
import { EnvironmentalData } from './weather';

export interface RoutineDay {
  day: number;
  title: string;
  focus: string;
  actionItems: string[];
}

export interface EventPlanResponse {
  routine: RoutineDay[];
  recommendedColors: string[];
  vtoGarmentSuggestions: { id: string; name: string; url: string; category: string }[];
}

export function generateEventPlan(
  skin: SkinAnalysisResult,
  env: EnvironmentalData,
  eventType: string
): EventPlanResponse {
  const isHighUV = env.uvIndexMax >= 6;
  const isLowHydration = skin.metrics.hydration < 60;
  const hasHighRedness = skin.metrics.redness > 40;

  // 1. Build 7-Day Skincare Prep Routine
  const routine: RoutineDay[] = [
    {
      day: 7,
      title: 'Exfoliation & Clean slate',
      focus: 'Remove dead skin cells gently',
      actionItems: ['Use a mild PHA or LHA chemical exfoliant', 'Apply barrier-supporting ceramide cream'],
    },
    {
      day: 5,
      title: 'Deep Hydration Focus',
      focus: isLowHydration ? 'Targeted moisture injection' : 'Maintenance hydration',
      actionItems: ['Layer Hyaluronic Acid serum on damp skin', 'Use a hydrating sheet mask before bed'],
    },
    {
      day: 3,
      title: 'Barrier Stabilization & Calm',
      focus: hasHighRedness ? 'Soothe inflammation and redness' : 'Skin barrier protection',
      actionItems: ['Incorporate Centella Asiatica or Niacinamide (2-5%)', 'Avoid new active products'],
    },
    {
      day: 1,
      title: 'Eve of the Event',
      focus: 'Plumpness & Glow',
      actionItems: ['Apply a rich sleeping mask', 'Ensure 8 hours of sleep and high water intake'],
    },
    {
      day: 0,
      title: 'Event Day Prep',
      focus: 'Sun Protection & Makeup Primer Base',
      actionItems: [
        isHighUV ? 'Apply Broad-Spectrum SPF 50+ (Reapply every 2 hours)' : 'Apply lightweight SPF 30',
        'Use a hydrating primer before makeup',
      ],
    },
  ];

  // 2. Determine Outfit Color Recommendations based on Skin Undertone
  let recommendedColors: string[] = [];
  if (skin.undertone === 'warm') {
    recommendedColors = ['Rose Gold', 'Warm Coral', 'Olive Green', 'Terracotta'];
  } else if (skin.undertone === 'cool') {
    recommendedColors = ['Dusty Rose', 'Emerald Green', 'Royal Blue', 'Soft Lavender'];
  } else {
    recommendedColors = ['Muted Rose Brown', 'Champagne', 'Jade', 'Dusty Pink'];
  }

  // 3. Mock Sample Garment Assets matching recommended palette
  const vtoGarmentSuggestions = [
    {
      id: 'g1',
      name: `${eventType} Rose Elegance Dress`,
      url: 'https://your-app.com/assets/garments/rose_dress.png',
      category: 'dresses',
    },
    {
      id: 'g2',
      name: `${eventType} Champagne Satin Ensemble`,
      url: 'https://your-app.com/assets/garments/champagne_suit.png',
      category: 'dresses',
    },
  ];

  return { routine, recommendedColors, vtoGarmentSuggestions };
}