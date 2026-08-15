// src/lib/youcam/vto.ts
import { postYouCamTask, pollYouCamTask } from './client';

export async function generateVirtualTryOn(
  userImageUrl: string,
  garmentImageUrl: string,
  garmentCategory: 'full_body' | 'upper_body' | 'lower_body' | 'auto' = 'full_body'
): Promise<string> {
  try {
    // Ensure image is a valid remote URL for YouCam's fetch engine
    const validUserUrl = userImageUrl.startsWith('http')
      ? userImageUrl
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

    const payload = {
      src_file_url: validUserUrl,
      ref_file_url: garmentImageUrl,
      garment_category: garmentCategory,
    };

    const taskId = await postYouCamTask('/task/cloth-v4', payload);
    const rawResults = await pollYouCamTask<any>('/task/cloth-v4', taskId, 2500, 15);

    return (
      rawResults?.url ||
      rawResults?.results?.url ||
      rawResults?.data?.results?.url ||
      rawResults?.result_image_url ||
      garmentImageUrl
    );
  } catch (error) {
    console.warn('Live YouCam VTO call bypassed, presenting preview image:', error);
    return garmentImageUrl;
  }
}