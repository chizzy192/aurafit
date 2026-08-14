import { postYouCamTask, pollYouCamTask } from './client';

export interface VTOResponse {
  result_image_url: string;
}

export async function generateVirtualTryOn(
  userImageUrl: string,
  garmentImageUrl: string,
  category: 'dresses' | 'tops' | 'outerwear' | 'bottoms' = 'dresses'
): Promise<string> {
  const payload = {
    model_image_url: userImageUrl,
    garment_image_url: garmentImageUrl,
    category: category,
  };

  const taskId = await postYouCamTask('/task/apparel-vto', payload);
  const result = await pollYouCamTask<VTOResponse>('/task/apparel-vto', taskId, 2500, 24);

  return result.result_image_url;
}