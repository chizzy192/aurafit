"use client";

// src/components/SkinQuestionnaireForm.tsx
//
// Collects the "tell us about your skin" answers, saves them to Supabase,
// and uses them (plus a real diagnostic snapshot if one exists) to drive
// both product recommendations and the dynamic color palette — no static
// lookups from here on.

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { recommendProducts, type SkinType, type PrimaryConcern, type ProductRecommendation } from "@/lib/skinProducts";
import { getPaletteForUser, type PaletteSwatch, type Undertone } from "@/lib/colors";

const SKIN_TYPES: SkinType[] = ["oily", "dry", "combination", "normal", "sensitive"];
const CONCERNS: { value: PrimaryConcern; label: string }[] = [
  { value: "hydration", label: "Hydration" },
  { value: "redness", label: "Redness" },
  { value: "dark_spots", label: "Dark spots" },
  { value: "texture", label: "Texture" },
  { value: "dark_circles", label: "Dark circles" },
  { value: "oiliness", label: "Oiliness" },
];
const SENSITIVITIES = ["Fragrance", "Retinoids", "Acids", "Sulfates", "Essential oils"];
const UNDERTONES: Undertone[] = ["warm", "cool", "neutral"];

type Props = {
  userId: string;
  detectedHex?: string | null; // pass through from a completed YouCam diagnostic, if you have one
};

export default function SkinQuestionnaireForm({ userId, detectedHex }: Props) {
  const supabase = getBrowserSupabase();

  const [skinType, setSkinType] = useState<SkinType>("normal");
  const [primaryConcern, setPrimaryConcern] = useState<PrimaryConcern>("hydration");
  const [sensitivities, setSensitivities] = useState<string[]>([]);
  const [undertone, setUndertone] = useState<Undertone>("neutral");

  const [recommendations, setRecommendations] = useState<ProductRecommendation[] | null>(null);
  const [palette, setPalette] = useState<PaletteSwatch[] | null>(null);
  const [paletteSource, setPaletteSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSensitivity = (tag: string) => {
    setSensitivities((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from("skin_profiles").upsert({
        user_id: userId,
        skin_type: skinType,
        primary_concern: primaryConcern,
        known_sensitivities: sensitivities,
        undertone,
      }, { onConflict: "user_id" });

      const recs = recommendProducts({ skinType, primaryConcern, knownSensitivities: sensitivities });
      setRecommendations(recs);

      const { baseHex, source, palette: dynamicPalette } = await getPaletteForUser({
        detectedHex,
        questionnaireUndertone: undertone,
      });
      setPalette(dynamicPalette);
      setPaletteSource(`${source} · seeded from ${baseHex}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-[28px] border border-[#E7CFC6]/60 bg-[#FFFDFB] p-8 shadow-[0_30px_80px_-40px_rgba(45,24,18,0.4)]">
      <p className="font-serif text-[13px] uppercase tracking-[0.25em] text-[#A85A48]">Skin Profile</p>
      <h2 className="mt-1 font-serif text-3xl text-[#2D1812]">Tell us about your skin</h2>
      <p className="mt-1.5 text-sm text-[#2D1812]/55">
        This guides your product picks and color palette — even before any photo diagnostic runs.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#2D1812]/50">Skin type</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SKIN_TYPES.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setSkinType(t)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition ${
                  skinType === t ? "border-[#A85A48] bg-[#2D1812] text-[#FDF2F0]" : "border-[#E7CFC6] text-[#2D1812]/70 hover:border-[#A85A48]/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#2D1812]/50">Primary concern</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CONCERNS.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setPrimaryConcern(c.value)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  primaryConcern === c.value ? "border-[#A85A48] bg-[#FDF2F0]" : "border-[#E7CFC6] text-[#2D1812]/70 hover:border-[#A85A48]/60"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#2D1812]/50">Known sensitivities</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SENSITIVITIES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleSensitivity(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  sensitivities.includes(s) ? "border-[#A85A48] bg-[#A85A48] text-white" : "border-[#E7CFC6] text-[#2D1812]/60 hover:border-[#A85A48]/60"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#2D1812]/50">Undertone</label>
          <div className="mt-2 flex gap-2">
            {UNDERTONES.map((u) => (
              <button
                type="button"
                key={u}
                onClick={() => setUndertone(u)}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition ${
                  undertone === u ? "border-[#A85A48] bg-[#2D1812] text-[#FDF2F0]" : "border-[#E7CFC6] text-[#2D1812]/70 hover:border-[#A85A48]/60"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#A85A48] py-3.5 text-sm font-semibold text-[#FFFDFB] shadow-lg shadow-[#A85A48]/20 transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Building your profile…" : "Save & get recommendations"}
        </button>
      </form>

      {recommendations && (
        <div className="mt-8 border-t border-[#E7CFC6]/60 pt-6">
          <p className="font-serif text-sm uppercase tracking-wider text-[#A85A48]">Recommended for you</p>
          <div className="mt-3 space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="rounded-xl bg-[#FDF2F0] px-4 py-3">
                <p className="text-sm font-semibold text-[#2D1812]">{r.productName}</p>
                <p className="text-xs text-[#2D1812]/55">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {palette && (
        <div className="mt-8 border-t border-[#E7CFC6]/60 pt-6">
          <p className="font-serif text-sm uppercase tracking-wider text-[#A85A48]">Your live color palette</p>
          {paletteSource && <p className="mt-1 text-[11px] text-[#2D1812]/40">{paletteSource}</p>}
          <div className="mt-3 flex gap-3">
            {palette.map((swatch) => (
              <div key={swatch.hex} className="flex-1 text-center">
                <div
                  className="aspect-square w-full rounded-2xl shadow-inner"
                  style={{ backgroundColor: swatch.hex }}
                />
                <p className="mt-1.5 truncate text-[10px] font-medium text-[#2D1812]/70">{swatch.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
