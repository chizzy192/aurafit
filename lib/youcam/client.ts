import { YouCamTaskResponse } from './types';

const BASE_URL = process.env.YOUCAM_BASE_URL || 'https://api.youcamapi.com/s2s/v2.0';
const API_KEY = process.env.YOUCAM_API_KEY || '';

export async function postYouCamTask<T>(endpoint: string, payload: Record<string, any>): Promise<string> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YouCam Task Initiation Failed [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  return data.task_id;
}

export async function pollYouCamTask<T>(
  endpoint: string,
  taskId: string,
  intervalMs = 2000,
  maxAttempts = 20
): Promise<T> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`${BASE_URL}${endpoint}?task_id=${taskId}`, {
      method: 'GET',
      headers: { 'API-KEY': API_KEY },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`YouCam Polling HTTP Error: ${response.statusText}`);
    }

    const data: YouCamTaskResponse<T> = await response.json();

    if (data.status === 'SUCCESS' && data.results) {
      return data.results;
    }

    if (data.status === 'FAILED') {
      throw new Error(`YouCam Processing Failed: ${data.error_message || 'Unknown error'}`);
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('YouCam Polling Timeout: The AI model took too long to complete.');
}