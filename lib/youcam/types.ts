export interface YouCamTaskResponse<T> {
  task_id: string;
  status: 'WAITING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  error_message?: string;
  results?: T;
}

export interface YouCamSkinRawMetrics {
  hydration?: { score: number };
  redness?: { score: number };
  spots?: { score: number };
  wrinkles?: { score: number };
  dark_circles?: { score: number };
}

export interface YouCamSkinRawResponse {
  skin_score: number;
  skin_type: string;
  undertone: 'warm' | 'cool' | 'neutral';
  metrics: YouCamSkinRawMetrics;
}

export interface YouCamVTORawResponse {
  result_image_url: string;
}