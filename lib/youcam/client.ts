// src/lib/youcam/client.ts
import { YouCamTaskResponse } from './types';

const BASE_URL = process.env.YOUCAM_BASE_URL || 'https://yce-api-01.makeupar.com/s2s/v2.0';
const API_KEY = process.env.YOUCAM_API_KEY || '';

export async function postYouCamTask<T>(endpoint: string, payload: Record<string, any>): Promise<string> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${BASE_URL}${cleanEndpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YouCam Task Initiation Failed [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  return data.task_id || data.data?.task_id || data.id;
}

export async function pollYouCamTask<T>(
  taskPathOrEndpoint: string,
  taskId: string,
  intervalMs = 2500,
  maxAttempts = 15
): Promise<T> {
  let attempts = 0;

  // YouCam REST status format: GET /task/{task_id} or GET {endpoint}/{task_id}
  const statusUrl = `${BASE_URL}/task/${taskId}`;

  while (attempts < maxAttempts) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s per polling tick

    try {
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If /task/{id} returns 404/405 on legacy endpoints, try {endpoint}/{id}
        if (response.status === 405 || response.status === 404) {
          const fallbackUrl = `${BASE_URL}${taskPathOrEndpoint.startsWith('/') ? taskPathOrEndpoint : `/${taskPathOrEndpoint}`}/${taskId}`;
          const fallbackRes = await fetch(fallbackUrl, {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            cache: 'no-store',
          });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (fallbackData.status === 'SUCCESS' || fallbackData.state === 'SUCCESS') {
              return (fallbackData.results || fallbackData.data || fallbackData) as T;
            }
          }
        }
        const errorText = await response.text();
        throw new Error(`YouCam Polling HTTP Error [${response.status}]: ${errorText}`);
      }

      const data: any = await response.json();
      const status = data.status || data.state;

      if (status === 'SUCCESS' || status === 'COMPLETED') {
        return (data.results || data.data || data) as T;
      }

      if (status === 'FAILED' || status === 'ERROR') {
        throw new Error(`YouCam Processing Failed: ${data.error_message || data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn(`Polling attempt ${attempts + 1} timed out, retrying...`);
      } else {
        throw err;
      }
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('YouCam Polling Timeout: The AI generation took longer than expected.');
}