// src/lib/skinProducts.ts
//
// Turns the skin questionnaire (skin_profiles table) plus, if available, a
// real YouCam diagnostic snapshot into a ranked product recommendation list.
// Questionnaire answers act as the reasoning guide whenever diagnostics are
// partial or absent — e.g. a user who hasn't run photo analysis yet still
// gets a real, explainable recommendation from what they told you directly.

export type SkinType = "oily" | "dry" | "combination" | "normal" | "sensitive";
export type PrimaryConcern =
  | "hydration" | "redness" | "dark_spots" | "texture" | "dark_circles" | "oiliness" | "none";

export type SkinQuestionnaireInput = {
  skinType: SkinType;
  primaryConcern: PrimaryConcern;
  knownSensitivities: string[]; // e.g. ["fragrance", "retinoids", "sulfates"]
};

export type DiagnosticInput = {
  hydration?: number;   // 0-100
  redness?: number;
  darkCircles?: number;
  texture?: number;
} | null;

export type ProductRecommendation = {
  category: string; // "cleanser" | "serum" | "spf" | "moisturizer" | "eye-care"
  productName: string;
  reason: string; // always cites the input that drove it — questionnaire answer or diagnostic score
  avoidFlag?: string; // populated if a known sensitivity conflicts with a normally-default pick
};

// A small curated catalog — swap for a live product-catalog table when you
// wire up the affiliate/commerce layer from the hardening roadmap.
const CATALOG = {
  cleanser: {
    default: "Gentle Gel Cleanser",
    sensitive: "Fragrance-Free Cream Cleanser",
    oily: "Salicylic Acid Foaming Cleanser",
  },
  serum_hydration: "Hyaluronic Acid + B5 Serum",
  serum_brightening: "Tranexamic Acid + Niacinamide Serum",
  serum_calming: "Centella Asiatica (Cica) Serum",
  serum_texture_active: "2% BHA Exfoliating Solution",
  serum_texture_gentle: "PHA Gentle Resurfacing Serum",
  eye_cream: "Caffeine + Peptide Eye Cream",
  spf: "Non-White-Cast Mineral-Hybrid SPF 50",
  moisturizer_barrier: "Ceramide Barrier Repair Cream",
  moisturizer_light: "Oil-Free Gel Moisturizer",
};

function hasSensitivity(input: SkinQuestionnaireInput, tag: string) {
  return input.knownSensitivities.some((s) => s.toLowerCase().includes(tag));
}

export function recommendProducts(
  questionnaire: SkinQuestionnaireInput,
  diagnostic: DiagnosticInput = null
): ProductRecommendation[] {
  const recs: ProductRecommendation[] = [];

  // --- Cleanser: driven by stated skin type, always present ---
  const cleanserPick = questionnaire.skinType === "sensitive"
    ? CATALOG.cleanser.sensitive
    : questionnaire.skinType === "oily"
      ? CATALOG.cleanser.oily
      : CATALOG.cleanser.default;

  recs.push({
    category: "cleanser",
    productName: cleanserPick,
    reason: `Matched to self-reported "${questionnaire.skinType}" skin type`,
  });

  // --- Primary serum: questionnaire concern is the base signal, diagnostic
  // score (if present) overrides/refines it with a specific number ---
  const concern = questionnaire.primaryConcern;
  const diagHydration = diagnostic?.hydration;
  const diagRedness = diagnostic?.redness;
  const diagTexture = diagnostic?.texture;
  const diagDarkCircles = diagnostic?.darkCircles;

  if (concern === "hydration" || (diagHydration !== undefined && diagHydration < 45)) {
    recs.push({
      category: "serum",
      productName: CATALOG.serum_hydration,
      reason: diagHydration !== undefined
        ? `Diagnostic hydration score ${diagHydration}/100 confirms low hydration`
        : `Self-reported primary concern: hydration`,
    });
  } else if (concern === "redness" || (diagRedness !== undefined && diagRedness > 35)) {
    recs.push({
      category: "serum",
      productName: CATALOG.serum_calming,
      reason: diagRedness !== undefined
        ? `Diagnostic redness score ${diagRedness}/100 flagged above threshold`
        : `Self-reported primary concern: redness`,
    });
  } else if (concern === "dark_spots") {
    recs.push({
      category: "serum",
      productName: CATALOG.serum_brightening,
      reason: `Self-reported primary concern: dark spots / uneven tone`,
    });
  } else if (concern === "texture" || (diagTexture !== undefined && diagTexture < 50)) {
    const activeOk = !hasSensitivity(questionnaire, "acid") && !hasSensitivity(questionnaire, "retinoid");
    recs.push({
      category: "serum",
      productName: activeOk ? CATALOG.serum_texture_active : CATALOG.serum_texture_gentle,
      reason: diagTexture !== undefined
        ? `Diagnostic texture score ${diagTexture}/100 below smoothness target`
        : `Self-reported primary concern: texture`,
      avoidFlag: activeOk ? undefined : `Switched to a gentler active — user flagged an acid/retinoid sensitivity`,
    });
  }

  // --- Eye care: only recommended if actually flagged, not by default ---
  if (concern === "dark_circles" || (diagDarkCircles !== undefined && diagDarkCircles > 35)) {
    recs.push({
      category: "eye-care",
      productName: CATALOG.eye_cream,
      reason: diagDarkCircles !== undefined
        ? `Diagnostic dark circle score ${diagDarkCircles}/100 flagged above threshold`
        : `Self-reported primary concern: dark circles`,
    });
  }

  // --- SPF: always included, sun protection is non-negotiable for event prep ---
  recs.push({
    category: "spf",
    productName: CATALOG.spf,
    reason: `Daily non-negotiable — formulated to avoid white cast on deeper skin tones`,
  });

  // --- Moisturizer: barrier-focused if redness/sensitivity present, light otherwise ---
  const needsBarrierFocus = questionnaire.skinType === "sensitive" || (diagRedness !== undefined && diagRedness > 35);
  recs.push({
    category: "moisturizer",
    productName: needsBarrierFocus ? CATALOG.moisturizer_barrier : CATALOG.moisturizer_light,
    reason: needsBarrierFocus
      ? `Barrier-focused pick — sensitive skin type or elevated redness score`
      : `Lightweight pick — no barrier flags detected`,
  });

  return recs;
}