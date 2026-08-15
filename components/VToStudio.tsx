// src/components/VToStudio.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getPaletteForUndertone, ColorSwatch } from "@/lib/colors";
import { Garment, GarmentFitType } from "@/lib/engine";

interface VToStudioProps {
  userImageUrl: string;
  undertone: "warm" | "cool" | "neutral";
  garments: Garment[];
}

const CATEGORY_TABS: { label: string; value: GarmentFitType | "all" }[] = [
  { label: "All Items", value: "all" },
  { label: "Full Body", value: "full_body" },
  { label: "Upper Body", value: "upper_body" },
  { label: "Lower Body", value: "lower_body" },
  { label: "Gele / Headwear", value: "headwear" },
  { label: "Footwear", value: "shoes" },
];

export const VToStudio: React.FC<VToStudioProps> = ({
  userImageUrl,
  undertone,
  garments = [],
}) => {
  const [activeCategory, setActiveCategory] = useState<GarmentFitType | "all">("all");
  const [swatches, setSwatches] = useState<ColorSwatch[]>([]);
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(garments[0] || null);
  const [renderedTryOnUrl, setRenderedTryOnUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter garments based on active tab
  const filteredGarments =
    activeCategory === "all"
      ? garments
      : garments.filter((g) => g.category === activeCategory);

  const displayedGarment =
    selectedGarment && filteredGarments.some((g) => g.id === selectedGarment.id)
      ? selectedGarment
      : filteredGarments[0] || null;

  useEffect(() => {
    async function loadColors() {
      const colors = await getPaletteForUndertone(undertone || "warm");
      setSwatches(colors);
    }
    loadColors();
  }, [undertone]);

  const handleTryOn = async () => {
    if (!displayedGarment) return;

    try {
      setIsProcessing(true);
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userImageUrl,
          garmentImageUrl: displayedGarment.url,
          category: displayedGarment.category,
        }),
      });

      const data = await res.json();
      if (data.resultImageUrl) {
        setRenderedTryOnUrl(data.resultImageUrl);
      }
    } catch (err) {
      console.error("VTO Error:", err);
      setRenderedTryOnUrl(displayedGarment.url);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-brand-surface border-2 border-brand-pink rounded-3xl p-6 md:p-8 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-terracotta font-bold">
            Step 3 • Virtual Fitting Suite
          </span>
          <h3 className="text-2xl font-bold text-brand-espresso">Try-On & Styling Studio</h3>
        </div>
        <span className="text-xs bg-brand-blush border border-brand-pink px-3 py-1 rounded-full font-bold text-brand-espresso self-start">
          {undertone} Undertone Matched
        </span>
      </div>

      {/* Dynamic Swatches with Visual Box & Color Name */}
      <div className="space-y-3 bg-brand-blush p-4 rounded-2xl border border-brand-pink">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-brand-espresso uppercase tracking-wider">
            Harmonized Color Palette
          </label>
          <span className="text-[10px] bg-brand-pink px-2.5 py-0.5 rounded-full font-bold text-brand-espresso">
            Live Color API
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {swatches.map((color, idx) => (
            <div
              key={idx}
              className="bg-white p-2 rounded-xl border border-brand-pink flex flex-col items-center text-center shadow-xs"
            >
              <div
                className="w-full h-9 rounded-lg mb-1.5 shadow-sm border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[11px] font-bold text-brand-espresso line-clamp-1">
                {color.name}
              </span>
              <span className="text-[9px] text-brand-mocha font-mono font-semibold">
                {color.hex}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveCategory(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeCategory === tab.value
                ? "bg-brand-espresso text-white shadow-xs"
                : "bg-brand-blush text-brand-mocha border border-brand-pink/60 hover:bg-brand-pink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VTO Canvas & Outfit Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="aspect-3/4 bg-brand-blush rounded-2xl overflow-hidden border-2 border-brand-pink relative flex items-center justify-center shadow-inner">
          <img
            src={renderedTryOnUrl || displayedGarment?.url || userImageUrl}
            alt="Virtual Try On Preview"
            className="w-full h-full object-cover"
          />

          {isProcessing && (
            <div className="absolute inset-0 bg-brand-espresso/85 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2" />
              Synthesizing {displayedGarment?.name || "Fit"}...
            </div>
          )}

          {renderedTryOnUrl && !isProcessing && (
            <div className="absolute bottom-3 left-3 bg-brand-espresso/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm shadow">
              ✨ {displayedGarment?.category.toUpperCase()} Active Fit
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-brand-espresso uppercase tracking-wider block">
              Wardrobe Catalog ({filteredGarments.length} Items)
            </span>
            <div className="space-y-2 max-h-75 overflow-y-auto pr-1">
              {filteredGarments.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setSelectedGarment(g);
                    setRenderedTryOnUrl(null);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition ${
                    selectedGarment?.id === g.id
                      ? "border-brand-espresso bg-brand-blush font-bold text-brand-espresso shadow-xs"
                      : "border-brand-pink/50 hover:border-brand-rose text-brand-mocha bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-bold text-brand-espresso">{g.name}</span>
                    <span className="text-[9px] bg-brand-pink px-2 py-0.5 rounded-md font-bold text-brand-espresso uppercase">
                      {g.category.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-[10px] text-brand-terracotta leading-relaxed">
                    💡 {g.matchReason}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleTryOn}
            disabled={isProcessing || !displayedGarment}
            className="w-full py-4 bg-brand-espresso hover:bg-brand-mocha text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
          >
            {isProcessing ? "Rendering Fit..." : `Virtually Try On This ${displayedGarment?.category.replace("_", " ") || "Piece"}`}
          </button>
        </div>
      </div>
    </div>
  );
};