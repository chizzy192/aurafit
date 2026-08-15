// src/lib/youcam/client.ts
//
// Low-level YouCam S2S primitives. Every YouCam AI feature (skin-analysis,
// cloth, shoes, scarf, hair-style, ...) follows the same three-step dance:
//
//   1. POST /s2s/v2.0/file/{feature}   -> { file_id, url }         (get an upload slot)
//   2. PUT  {url}                       -> upload raw image bytes  (fill the slot)
//   3. POST /s2s/v2.0/task/{feature}   -> { task_id }              (start the AI job)
//   4. GET  /s2s/v2.0/task/{feature}/{task_id} -> poll until task_status is
//      "success" or "error"
//
// This file implements steps 1, 2, and 4 generically (they're identical
// across every feature). Step 3's request BODY differs per feature/category —
// that's handled per-category in vto.ts, not here.

const YOUCAM_BASE = "https://yce-api-01.makeupar.com/s2s/v2.0";

function authHeaders() {
  const apiKey = process.env.YOUCAM_API_KEY;
  if (!apiKey) throw new Error("YOUCAM_API_KEY is not set in the environment");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export type YouCamFileSlot = {
  fileId: string;
  uploadUrl: string;
};

/**
 * Step 1+2: request an upload slot for a given feature, then push the actual
 * image bytes to it. Returns the file_id you'll reference in the task body.
 *
 * `imageInput` can be a Buffer (server-side, e.g. from Supabase Storage
 * download) or a public https URL string — pass whichever you have.
 */
export async function uploadImageToYouCam(
  feature: string, // e.g. "cloth", "skin-analysis", "shoes"
  imageInput: Buffer | ArrayBuffer,
  contentType: string = "image/jpeg"
): Promise<YouCamFileSlot> {
  // 1. Request an upload slot
  const fileRes = await fetch(`${YOUCAM_BASE}/file/${feature}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      content_type: contentType,
      // Some features expect an array under `files`; if the File API
      // response shape you get back in the Playground looks different,
      // this is the one line most likely to need adjusting.
      files: [{ content_type: contentType }],
    }),
  });

  if (!fileRes.ok) {
    throw new Error(`YouCam file-slot request failed (${fileRes.status}): ${await fileRes.text()}`);
  }

  const fileJson = await fileRes.json();

  // Response shapes vary slightly by feature/version — handle both a single
  // object and an array under `requests` defensively.
  const request = Array.isArray(fileJson.requests) ? fileJson.requests[0] : fileJson.requests ?? fileJson;
  const fileId: string = fileJson.file_id ?? request.file_id;
  const uploadUrl: string = request.url ?? fileJson.url;

  if (!fileId || !uploadUrl) {
    throw new Error(`Unexpected File API response shape: ${JSON.stringify(fileJson)}`);
  }

  // 2. Upload the actual bytes to the slot. This step is easy to forget —
  // Perfect Corp's docs explicitly warn that skipping it produces a
  // confusing 404/500 on the *task* call, not the file call.
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: imageInput,
  });

  if (!uploadRes.ok) {
    throw new Error(`YouCam file upload failed (${uploadRes.status})`);
  }

  return { fileId, uploadUrl };
}

export type YouCamTaskStatus = "running" | "success" | "error" | string;

export type YouCamTaskResult = {
  taskId: string;
  status: YouCamTaskStatus;
  resultUrl?: string;
  dstId?: string;
  raw: any;
};

/**
 * Step 3: create a task. The payload shape is feature/category-specific —
 * build it in vto.ts (or wherever calls this) and pass it straight through.
 */
export async function createYouCamTask(feature: string, payload: Record<string, any>): Promise<string> {
  const res = await fetch(`${YOUCAM_BASE}/task/${feature}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`YouCam task creation failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  const taskId = json.task_id ?? json.data?.task_id;
  if (!taskId) throw new Error(`No task_id in response: ${JSON.stringify(json)}`);
  return taskId;
}

/**
 * Step 4: poll a single time. Callers loop this (see pollUntilDone below) —
 * kept separate so a queue/worker context (see production roadmap) can call
 * it once per invocation instead of blocking in a loop.
 */
export async function getYouCamTaskStatus(feature: string, taskId: string): Promise<YouCamTaskResult> {
  const res = await fetch(`${YOUCAM_BASE}/task/${feature}/${taskId}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`YouCam status check failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  const data = json.data ?? json;
  const status: YouCamTaskStatus = data.task_status ?? data.status;

  // Result URL location varies by feature; check the common spots.
  const resultUrl =
    data.results?.[0]?.url ??
    data.results?.output?.[0]?.url ??
    data.dst_urls?.[0] ??
    data.url;

  return {
    taskId,
    status,
    resultUrl,
    dstId: data.dst_id,
    raw: json,
  };
}

/**
 * Convenience wrapper: polls until success/error or timeout. Fine for a
 * hackathon demo running inside a single API route. In production, swap
 * this for the BullMQ worker pattern from the hardening roadmap — this
 * function is exactly what belongs INSIDE that worker's job handler.
 */
export async function pollUntilDone(
  feature: string,
  taskId: string,
  { intervalMs = 2000, timeoutMs = 60000 } = {}
): Promise<YouCamTaskResult> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await getYouCamTaskStatus(feature, taskId);
    if (result.status === "success" || result.status === "error") return result;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`YouCam task ${taskId} timed out after ${timeoutMs}ms`);
}