"use client";

// src/components/GarmentUploadStudio.tsx
//
// Replaces the static WARDROBE_CATALOG flow: the user uploads their OWN
// garment/scarf/tie image, tags it with a body part, and can run a real
// YouCam try-on against their captured portrait. Design direction: modern
// beauty-brand editorial — warm ivory surfaces, generous whitespace, a
// serif display face for headings, soft elevation instead of hard borders.

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import type { BodyPartCategory } from "@/lib/youcam/vto";

const BODY_PART_OPTIONS: { value: BodyPartCategory; label: string; helper: string }[] = [
  { value: "full_body", label: "Full Body", helper: "Gowns, jumpsuits, Asoebi" },
  { value: "upper_body", label: "Upper Body", helper: "Blazers, corsets, tops" },
  { value: "lower_body", label: "Lower Body", helper: "Skirts, trousers" },
  { value: "headwear", label: "Headwear", helper: "Gele, fedora, fascinator" },
  { value: "scarf", label: "Scarf / Tie", helper: "Neckwear, drapes" },
  { value: "footwear", label: "Footwear", helper: "Heels, boots" },
];

type Garment = {
  id: string;
  name: string;
  body_part: BodyPartCategory;
  storage_path: string;
  publicUrl: string;
};

type GarmentUploadStudioProps = {
  userId: string;
  userPortraitUrl: string | null; // the captured/demo photo to try garments on
};

export default function GarmentUploadStudio({ userId, userPortraitUrl }: GarmentUploadStudioProps) {
  const supabase = getBrowserSupabase();

  const [selectedPart, setSelectedPart] = useState<BodyPartCategory>("full_body");
  const [garments, setGarments] = useState<Garment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tryOnLoadingId, setTryOnLoadingId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGarments = async () => {
    const { data, error: fetchError } = await supabase
      .from("garments")
      .select("id, name, body_part, storage_path")
      .eq("user_id", userId)
      .eq("body_part", selectedPart)
      .order("created_at", { ascending: false });

    if (fetchError) { setError(fetchError.message); return; }

    const withUrls = (data ?? []).map((g) => ({
      ...g,
      publicUrl: supabase.storage.from("garments").getPublicUrl(g.storage_path).data.publicUrl,
    })) as Garment[];

    setGarments(withUrls);
  };

  useEffect(() => { loadGarments(); /* eslint-disable-next-line */ }, [selectedPart]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const path = `${userId}/${selectedPart}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("garments").upload(path, file, {
        contentType: file.type,
      });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("garments").insert({
        user_id: userId,
        name: file.name.replace(/\.[^/.]+$/, ""),
        body_part: selectedPart,
        storage_path: path,
      });
      if (insertError) throw insertError;

      await loadGarments();
    } catch (err: any) {
      setError(err.message ?? "Upload failed — please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleTryOn = async (garment: Garment) => {
    if (!userPortraitUrl) {
      setError("Capture or select a portrait first, on the intake step.");
      return;
    }
    setTryOnLoadingId(garment.id);
    setError(null);
    setResultUrl(null);
    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyPart: garment.body_part,
          userImageUrl: userPortraitUrl,
          garmentImageUrl: garment.publicUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Try-on failed");
      setResultUrl(json.resultUrl);
    } catch (err: any) {
      setError(err.message ?? "Try-on failed — the styling engine may be busy, try again shortly.");
    } finally {
      setTryOnLoadingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-[28px] border border-[#E7CFC6]/60 bg-gradient-to-b from-[#FFFDFB] to-[#FDF2F0] p-8 shadow-[0_30px_80px_-40px_rgba(45,24,18,0.4)]">
        <p className="font-serif text-[13px] uppercase tracking-[0.25em] text-[#A85A48]">
          Wardrobe Studio
        </p>
        <h2 className="mt-1 font-serif text-3xl text-[#2D1812]">Your pieces, virtually fitted</h2>
        <p className="mt-1.5 text-sm text-[#2D1812]/55">
          Upload garments tagged by fit — we'll place them on your portrait.
        </p>

        {/* Body part selector — pill row */}
        <div className="mt-6 flex flex-wrap gap-2">
          {BODY_PART_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedPart(opt.value)}
              className={`group rounded-2xl border px-4 py-2.5 text-left transition-all ${
                selectedPart === opt.value
                  ? "border-[#A85A48] bg-[#2D1812] text-[#FDF2F0] shadow-md"
                  : "border-[#E7CFC6] bg-white/70 text-[#2D1812] hover:border-[#A85A48]/60"
              }`}
            >
              <span className="block text-sm font-semibold">{opt.label}</span>
              <span className={`block text-[11px] ${selectedPart === opt.value ? "text-[#FDF2F0]/70" : "text-[#2D1812]/45"}`}>
                {opt.helper}
              </span>
            </button>
          ))}
        </div>

        {/* Upload dropzone */}
        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#C68B7B]/50 bg-white/60 py-8 text-center transition hover:border-[#A85A48] hover:bg-white">
          <span className="text-sm font-semibold text-[#A85A48]">
            {uploading ? "Uploading…" : `Add a ${BODY_PART_OPTIONS.find((o) => o.value === selectedPart)?.label.toLowerCase()} piece`}
          </span>
          <span className="text-xs text-[#2D1812]/45">JPG or PNG, plain background recommended</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </label>

        {error && (
          <p className="mt-3 rounded-xl bg-[#2D1812]/5 px-4 py-2.5 text-xs text-[#A85A48]">{error}</p>
        )}

        {/* Garment gallery for the selected body part */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {garments.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-2xl border border-[#E7CFC6]/60 bg-white shadow-sm">
              <img src={g.publicUrl} alt={g.name} className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-xs font-semibold text-[#2D1812]">{g.name}</p>
                <button
                  type="button"
                  onClick={() => handleTryOn(g)}
                  disabled={tryOnLoadingId === g.id}
                  className="mt-2 w-full rounded-lg bg-[#A85A48] py-1.5 text-[11px] font-semibold text-[#FFFDFB] transition hover:opacity-90 disabled:opacity-40"
                >
                  {tryOnLoadingId === g.id ? "Styling…" : "Try it on"}
                </button>
              </div>
            </div>
          ))}
          {garments.length === 0 && (
            <p className="col-span-full py-6 text-center text-xs text-[#2D1812]/40">
              No {selectedPart.replace("_", " ")} pieces yet — add one above.
            </p>
          )}
        </div>

        {/* Result */}
        {resultUrl && (
          <div className="mt-8 rounded-2xl border border-[#C68B7B]/40 bg-white p-4">
            <p className="mb-2 font-serif text-sm uppercase tracking-wider text-[#A85A48]">Result</p>
            <img src={resultUrl} alt="Virtual try-on result" className="mx-auto max-h-[480px] rounded-xl object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}
