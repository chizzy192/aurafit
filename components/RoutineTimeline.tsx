"use client";

import React from "react";
import { RoutineDay } from "@/lib/engine";

interface RoutineTimelineProps {
  routine: RoutineDay[];
}

export const RoutineTimeline: React.FC<RoutineTimelineProps> = ({ routine }) => {
  return (
    <div className="bg-brand-surface border border-brand-pink/50 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-brand-darkRose">
        7-Day Skin Prep Countdown
      </h3>

      <div className="space-y-4 border-l-2 border-brand-pink pl-4">
        {routine.map((step) => (
          <div key={step.day} className="relative group">
            <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-brand-rose border-2 border-white shadow-sm" />
            <div className="text-xs font-bold text-brand-darkRose uppercase tracking-wider">
              {step.day === 0 ? "Event Day" : `T-${step.day} Days`} • {step.title}
            </div>
            <div className="text-xs text-neutral-500 mb-1 font-medium">{step.focus}</div>
            <ul className="text-xs text-neutral-700 list-disc list-inside space-y-0.5">
              {step.actionItems.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};