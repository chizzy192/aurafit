import { postYouCamTask, pollYouCamTask } from './client';

export interface SkinAnalysisResult {
  overall_score: number;
  skin_type: string;
  metrics: {
    hydration: number; // 0 - 100
    redness: number;   // 0 - 100
    spots: number;     // 0 - 100
    wrinkles: number;  // 0 - 100
    dark_circles: number;
  };
  undertone: 'warm' | 'cool' | 'neutral';
}

export async function analyzeSkin(imageUrl: string): Promise<SkinAnalysisResult> {
  const payload = {
    image_url: imageUrl,
    actions: ['hydration', 'redness', 'spots', 'wrinkles', 'dark_circles', 'skin_type', 'undertone'],
  };

  // 1. Submit job
  const taskId = await postYouCamTask('/task/skin-analysis', payload);

  // 2. Poll until complete
  const rawResults = await pollYouCamTask<any>('/task/skin-analysis', taskId);

  // 3. Format & Normalize output
  return {
    overall_score: rawResults.skin_score ?? 75,
    skin_type: rawResults.skin_type ?? 'combination',
    metrics: {
      hydration: rawResults.metrics?.hydration?.score ?? 50,
      redness: rawResults.metrics?.redness?.score ?? 20,
      spots: rawResults.metrics?.spots?.score ?? 15,
      wrinkles: rawResults.metrics?.wrinkles?.score ?? 10,
      dark_circles: rawResults.metrics?.dark_circles?.score ?? 30,
    },
    undertone: rawResults.undertone ?? 'neutral',
  };
}