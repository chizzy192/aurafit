// src/lib/youcam/vto.ts
//
// Maps a body-part / accessory category to its correct YouCam feature slug
// and request payload shape, then runs the full upload -> task -> poll flow.
//
// VERIFY BEFORE SHIPPING: `cloth` and `shoes` payload shapes below are
// confirmed against Perfect Corp's current docs. `scarf` and `headwear` are
// marked UNVERIFIED — open your API Playground, build one request for each
// in the UI, and copy the exact field names it generates into the stubs
// below. Shipping a fabricated field name here fails silently as a 400, and
// that's a worse debugging experience than a five-minute Playground check.

import { uploadImageToYouCam, createYouCamTask, pollUntilDone } from "./client";

export type BodyPartCategory =
  | "full_body"
  | "upper_body"
  | "lower_body"
  | "headwear" // gele, fedora, etc.
  | "scarf"
  | "footwear";

type CategoryConfig = {
  feature: string; // the {feature} segment in /task/{feature}
  verified: boolean;
  buildPayload: (srcFileId: string, refFileId: string, opts?: Record<string, any>) => Record<string, any>;
};

const CATEGORY_CONFIG: Record<BodyPartCategory, CategoryConfig> = {
  full_body: {
    feature: "cloth",
    verified: true,
    buildPayload: (srcFileId, refFileId, opts) => ({
      src_file_id: srcFileId,
      ref_file_id: refFileId,
      garment_category: "full_body",
      change_shoes: opts?.changeShoes ?? false,
    }),
  },
  upper_body: {
    feature: "cloth",
    verified: true,
    buildPayload: (srcFileId, refFileId, opts) => ({
      src_file_id: srcFileId,
      ref_file_id: refFileId,
      garment_category: "upper_body",
      change_shoes: opts?.changeShoes ?? false,
    }),
  },
  lower_body: {
    feature: "cloth",
    verified: true,
    buildPayload: (srcFileId, refFileId, opts) => ({
      src_file_id: srcFileId,
      ref_file_id: refFileId,
      garment_category: "lower_body",
      change_shoes: opts?.changeShoes ?? false,
    }),
  },
  footwear: {
    feature: "shoes",
    verified: true,
    buildPayload: (srcFileId, refFileId, opts) => ({
      src_file_id: srcFileId,
      ref_file_id: refFileId,
      gender: opts?.gender ?? "female",
      style: opts?.style, // one of style_minimalist | style_bohemian | style_cottagecore | style_french_elegance | style_retro_fashion
    }),
  },
  headwear: {
    feature: "hat", // UNVERIFIED — confirm exact slug in Playground (may be "hat" or "headwear")
    verified: false,
    buildPayload: (srcFileId, refFileId) => ({
      src_file_id: srcFileId,
      ref_file_id: refFileId,
      // Fashion-accessory endpoints (earrings, necklaces) sometimes need
      // ref_file_urls (array) + object_infos instead of a single ref_file_id.
      // Check your Playground request body for "hat"/"headwear" specifically.
    }),
  },
  scarf: {
    feature: "scarf", // UNVERIFIED — confirm exact slug in Playground
    verified: false,
    buildPayload: (srcFileId, refFileId) => ({
      src_file_id: srcFileId,
      ref_file_id: refFileId,
    }),
  },
};

export type TryOnInput = {
  category: BodyPartCategory;
  userImage: Buffer | ArrayBuffer; // the wearer's photo, tagged by body part at capture time
  garmentImage: Buffer | ArrayBuffer; // the user-uploaded garment/scarf/tie image
  contentType?: string;
  options?: Record<string, any>;
};

export type TryOnResult = {
  resultUrl: string;
  taskId: string;
  category: BodyPartCategory;
};

/**
 * Runs a full try-on: uploads both images, creates the category-appropriate
 * task, and polls to completion. Throws if the category is unverified and
 * you haven't swapped in a confirmed payload — better to fail loudly at
 * build time than silently ship a guessed field name.
 */
export async function runVirtualTryOn(input: TryOnInput): Promise<TryOnResult> {
  const config = CATEGORY_CONFIG[input.category];
  const contentType = input.contentType ?? "image/jpeg";

  const [srcSlot, refSlot] = await Promise.all([
    uploadImageToYouCam(config.feature, input.userImage, contentType),
    uploadImageToYouCam(config.feature, input.garmentImage, contentType),
  ]);

  const payload = config.buildPayload(srcSlot.fileId, refSlot.fileId, input.options);
  const taskId = await createYouCamTask(config.feature, payload);
  const result = await pollUntilDone(config.feature, taskId, { timeoutMs: 90000 });

  if (result.status === "error") {
    throw new Error(`YouCam ${config.feature} task failed: ${JSON.stringify(result.raw)}`);
  }
  if (!result.resultUrl) {
    throw new Error(`YouCam ${config.feature} task succeeded but returned no result URL: ${JSON.stringify(result.raw)}`);
  }

  return { resultUrl: result.resultUrl, taskId, category: input.category };
}

/** Which body-part categories are safe to expose in the UI right now. */
export function getVerifiedCategories(): BodyPartCategory[] {
  return (Object.keys(CATEGORY_CONFIG) as BodyPartCategory[]).filter((k) => CATEGORY_CONFIG[k].verified);
}