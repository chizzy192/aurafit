// src/lib/colors.ts
//
// Replaces a static undertone->palette lookup with a genuinely dynamic call:
// takes the ACTUAL detected skin hex from YouCam diagnostics (or a
// questionnaire-derived seed if diagnostics haven't run) and asks The Color
// API to generate a live, mathematically-derived harmonious palette from it.
// Two different users with slightly different detected undertones get
// different palettes — that's the point.

const COLOR_API_BASE = "https://www.thecolorapi.com";

export type Undertone = "warm" | "cool" | "neutral";

export type PaletteSwatch = {
  hex: string;
  name: string;
  rgb: { r: number; g: number; b: number };
};

export type ColorSwatch = PaletteSwatch;

// In-memory cache — a given hex + mode combination always returns the same
// palette (the API is deterministic), so there's no reason to re-fetch it
// within a session. For multi-instance/production use, swap this Map for
// Upstash Redis (see the hardening roadmap, §5) — the interface is identical.
const paletteCache = new Map<string, PaletteSwatch[]>();

/**
 * Seed hex used ONLY when no real diagnostic hex is available yet (e.g. the
 * user filled out the skin questionnaire but hasn't run photo diagnostics).
 * This is intentionally a minimal 3-value seed table, not a full palette —
 * the actual palette is always generated live from here, never hardcoded.
 */
const UNDERTONE_SEED_HEX: Record<Undertone, string> = {
  warm: "A85A48",   // terracotta seed
  cool: "6B5B7B",   // dusk mauve seed
  neutral: "B08968", // sandstone seed
};

type ColorApiIdResponse = {
  hex: { value: string };
  name: { value: string };
  rgb: { r: number; g: number; b: number; value: string };
};

type ColorApiSchemeResponse = {
  colors: ColorApiIdResponse[];
};

/**
 * Generates a live 5-color harmonious palette from a base hex.
 * `mode` controls the color-theory relationship:
 *   - "analogic"        neighboring hues, safe/cohesive (default)
 *   - "complement"       single opposite-hue accent
 *   - "analogic-complement" 4 analogous + 1 complementary pop color
 *   - "triad" / "quad"    more contrast, bolder styling
 */
export async function getDynamicPalette(
  baseHex: string,
  mode: "analogic" | "complement" | "analogic-complement" | "triad" | "quad" = "analogic-complement"
): Promise<PaletteSwatch[]> {
  const cleanHex = baseHex.replace("#", "").toUpperCase();
  const cacheKey = `${cleanHex}:${mode}`;
  const cached = paletteCache.get(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `${COLOR_API_BASE}/scheme?hex=${cleanHex}&mode=${mode}&count=5`
  );
  if (!res.ok) {
    throw new Error(`The Color API scheme request failed (${res.status})`);
  }
  const json: ColorApiSchemeResponse = await res.json();

  const swatches: PaletteSwatch[] = json.colors.map((c) => ({
    hex: `#${c.hex.value.replace("#", "")}`,
    name: c.name.value,
    rgb: { r: c.rgb.r, g: c.rgb.g, b: c.rgb.b },
  }));

  paletteCache.set(cacheKey, swatches);
  return swatches;
}

export async function getPaletteForUndertone(undertone: Undertone): Promise<ColorSwatch[]> {
  const { palette } = await getPaletteForUser({ questionnaireUndertone: undertone });
  return palette;
}

/**
 * Contrast/luminance detail for a single hex — useful for deciding text
 * color or flagging "this shade will wash you out" style warnings.
 */
export async function getColorDetail(hex: string): Promise<ColorApiIdResponse> {
  const cleanHex = hex.replace("#", "").toUpperCase();
  const res = await fetch(`${COLOR_API_BASE}/id?hex=${cleanHex}`);
  if (!res.ok) throw new Error(`The Color API id request failed (${res.status})`);
  return res.json();
}

/**
 * Main entry point for the app: given whatever skin data is currently
 * available, resolve the best base hex and return a live palette.
 *
 * Priority: real detected hex from YouCam skin analysis > questionnaire
 * undertone seed > neutral fallback. This is what makes recommendations
 * dynamic per-user instead of one of three static buckets.
 */
export async function getPaletteForUser(params: {
  detectedHex?: string | null; // from YouCam skin-analysis result, if available
  questionnaireUndertone?: Undertone | null;
}): Promise<{ baseHex: string; source: "diagnostic" | "questionnaire" | "default"; palette: PaletteSwatch[] }> {
  let baseHex: string;
  let source: "diagnostic" | "questionnaire" | "default";

  if (params.detectedHex) {
    baseHex = params.detectedHex;
    source = "diagnostic";
  } else if (params.questionnaireUndertone) {
    baseHex = UNDERTONE_SEED_HEX[params.questionnaireUndertone];
    source = "questionnaire";
  } else {
    baseHex = UNDERTONE_SEED_HEX.neutral;
    source = "default";
  }

  const palette = await getDynamicPalette(baseHex);
  return { baseHex, source, palette };
}