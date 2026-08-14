"use client";

import React, { useState } from "react";
import { EventForm } from "@/components/EventForm";
import { SkinReport } from "@/components/SkinReport";
import { RoutineTimeline } from "@/components/RoutineTimeline";
import { VToStudio } from "@/components/VToStudio";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string>("");

  const handlePlanGenerate = async (formData: any) => {
    setLoading(true);
    setCurrentImage(formData.userImageUrl);
    try {
      const res = await fetch("/api/event-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-light py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-brand-darkRose tracking-tight">
            AuraFit: AI Event Concierge
          </h1>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto">
            Personalized 7-day skin prep countdowns and color-matched virtual outfit try-ons for life's key moments.
          </p>
        </header>

        <EventForm onSubmit={handlePlanGenerate} isLoading={loading} />

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-6">
              <SkinReport skin={data.skinResults} env={data.envResults} />
              <RoutineTimeline routine={data.plan.routine} />
            </div>

            <div>
              <VToStudio
                userImageUrl={currentImage}
                garments={data.plan.vtoGarmentSuggestions}
                recommendedColors={data.plan.recommendedColors}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}