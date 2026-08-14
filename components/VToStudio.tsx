"use client";

import React, { useState } from "react";

interface Garment {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface VToStudioProps {
  userImageUrl: string;
  garments: Garment[];
  recommendedColors: string[];
}

export const VToStudio: React.FC<VToStudioProps> = ({
  userImageUrl,
  garments,
  recommendedColors,
}) => {
  const [selectedGarment, setSelectedGarment] = useState<Garment>(garments[0]);
  const [renderedTryOnUrl, setRenderedTryOnUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTryOn = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userImageUrl: userImageUrl,
          garmentImageUrl: selectedGarment.url,
          category: selectedGarment.category,
        }),
      });

      const data = await res.json();
      if (data.resultImageUrl) {
        setRenderedTryOnUrl(data.resultImageUrl);
      }
    } catch (err) {
      console.error("VTO Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-pink/50 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-brand-darkRose">
          Apparel Virtual Try-On
        </h3>
        <div className="flex gap-1">
          {recommendedColors.map((color, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 bg-brand-light border border-brand-pink text-brand-darkRose rounded-md font-medium"
            >
              {color}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preview Frame */}
        <div className="aspect-[3/4] bg-brand-light rounded-xl overflow-hidden border border-brand-pink flex items-center justify-center relative">
          <img
            src={renderedTryOnUrl || userImageUrl}
            alt="Try On Output"
            className="w-full h-full object-cover"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white text-xs font-semibold">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2" />
              Rendering YouCam VTO...
            </div>
          )}
        </div>

        {/* Outfit Selection Controls */}
        <div className="flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-semibold text-neutral-600 block mb-2">
              Select Garment to Try On:
            </span>
            <div className="space-y-2">
              {garments.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGarment(g)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                    selectedGarment.id === g.id
                      ? "border-brand-rose bg-brand-light font-semibold text-brand-darkRose"
                      : "border-neutral-200 hover:border-brand-pink text-neutral-700"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleTryOn}
            disabled={isProcessing}
            className="w-full py-3 bg-brand-rose hover:bg-brand-darkRose text-white font-medium rounded-xl text-sm transition duration-200 shadow disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : `Try On Selected Outfit`}
          </button>
        </div>
      </div>
    </div>
  );
};