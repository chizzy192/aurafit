"use client";

import React from "react";
import { SkinAnalysisResult } from "@/lib/youcam/skin";
import { EnvironmentalData } from "@/lib/weather";

interface SkinReportProps {
  skin: SkinAnalysisResult;
  env: EnvironmentalData;
}

export const SkinReport: React.FC<SkinReportProps> = ({ skin, env }) => {
  return (
    <div className="bg-brand-surface border border-brand-pink/50 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-brand-pink/40 pb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-brand-darkRose font-semibold">
            Diagnostic Summary
          </span>
          <h3 className="text-xl font-bold text-neutral-800">
            Overall Score: {skin.overall_score}/100
          </h3>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-brand-pink/40 text-brand-darkRose rounded-full text-xs font-semibold uppercase">
            {skin.undertone} Undertone
          </span>
        </div>
      </div>

      {/* Environmental Context Badge */}
      <div className="bg-brand-light p-3 rounded-xl flex items-center justify-between text-xs text-neutral-700">
        <div>
          <span className="font-semibold text-brand-darkRose">Forecast: </span>
          {env.condition} ({env.tempMaxC}°C)
        </div>
        <div className="font-semibold text-rose-600">
          UV Index: {env.uvIndexMax} {env.uvIndexMax >= 6 ? "(High Exposure)" : "(Moderate)"}
        </div>
      </div>

      {/* Skin Metrics Progress */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="flex justify-between text-xs text-neutral-600 mb-1">
            <span>Hydration</span>
            <span>{skin.metrics.hydration}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div
              className="bg-brand-rose h-2 rounded-full"
              style={{ width: `${skin.metrics.hydration}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-neutral-600 mb-1">
            <span>Redness / Barrier</span>
            <span>{skin.metrics.redness}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div
              className="bg-brand-darkRose h-2 rounded-full"
              style={{ width: `${skin.metrics.redness}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};