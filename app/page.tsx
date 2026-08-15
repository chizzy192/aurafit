// src/app/page.tsx
"use client";

import React, { useState } from "react";
import { EventForm } from "@/components/EventForm";
import { SkinReport } from "@/components/SkinReport";
import { RoutineTimeline } from "@/components/RoutineTimeline";
import { VToStudio } from "@/components/VToStudio";
import { AuthModal } from "@/components/AuthModal";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"hero" | "planner" | "results">("hero");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
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
        setCurrentScreen("results");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col selection:bg-brand-pink text-neutral-800">
      {/* Top Luxury Navigation */}
      <header className="border-b border-brand-pink/40 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div
            onClick={() => setCurrentScreen("hero")}
            className="cursor-pointer flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-brand-rose flex items-center justify-center text-white text-xs font-serif font-bold shadow-sm">
              A
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-brand-darkRose">
              AuraFit
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-neutral-600">
            <button onClick={() => setCurrentScreen("hero")} className="hover:text-brand-darkRose transition">
              Overview
            </button>
            <button onClick={() => setCurrentScreen("planner")} className="hover:text-brand-darkRose transition">
              Event Planner
            </button>
            {data && (
              <button onClick={() => setCurrentScreen("results")} className="text-brand-darkRose font-bold">
                My Protocol
              </button>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-4 py-2 text-xs font-bold text-brand-darkRose border border-brand-pink hover:bg-brand-light rounded-xl transition"
            >
              Sign In
            </button>
            <button
              onClick={() => setCurrentScreen("planner")}
              className="px-4 py-2 text-xs font-bold bg-brand-rose hover:bg-brand-darkRose text-white rounded-xl shadow-xs transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Screens */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:py-12">
        {/* SCREEN 1: LUXURY HERO */}
        {currentScreen === "hero" && (
          <div className="space-y-16 animate-in fade-in duration-300">
            <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
              <span className="px-4 py-1.5 bg-brand-pink/50 border border-brand-pink text-brand-darkRose text-xs font-bold rounded-full uppercase tracking-widest inline-block">
                Powered by Perfect Corp YouCam AI
              </span>
              <h1 className="text-4xl sm:text-6xl font-serif font-bold text-neutral-900 tracking-tight leading-[1.15]">
                Redefining the Future of <br className="hidden sm:inline" />
                <span className="text-brand-darkRose italic">Skin & Fashion Retail.</span>
              </h1>
              <p className="text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
                AuraFit prepares you for life’s defining moments with personalized 7-day skincare countdowns, hyper-local UV defense, and color-matched virtual fittings.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <button
                  onClick={() => setCurrentScreen("planner")}
                  className="px-8 py-4 bg-brand-rose hover:bg-brand-darkRose text-white font-bold rounded-2xl shadow-lg transition duration-200"
                >
                  Start Event Consultation
                </button>
              </div>
            </section>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-brand-pink/50 p-6 rounded-3xl space-y-3 shadow-xs">
                <span className="text-2xl">✨</span>
                <h3 className="font-bold text-brand-darkRose text-lg">YouCam Skin AI Diagnostics</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Real-time barrier analysis, hydration scores, and undertone detection to pre-game your skin.
                </p>
              </div>

              <div className="bg-white border border-brand-pink/50 p-6 rounded-3xl space-y-3 shadow-xs">
                <span className="text-2xl">☀️</span>
                <h3 className="font-bold text-brand-darkRose text-lg">Hyper-Local Weather & UV</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Live atmospheric tracking adjusts prep routines so your skin is protected before high exposure.
                </p>
              </div>

              <div className="bg-white border border-brand-pink/50 p-6 rounded-3xl space-y-3 shadow-xs">
                <span className="text-2xl">👗</span>
                <h3 className="font-bold text-brand-darkRose text-lg">Generative Apparel VTO</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Harmonized outfit palette matching and generative try-on to eliminate fitting uncertainty.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: EVENT CONFIGURATOR & PHOTO CAPTURE */}
        {currentScreen === "planner" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif font-bold text-brand-darkRose">
                Event Consultation Studio
              </h2>
              <p className="text-xs text-neutral-600">
                Upload or snap a selfie and set your destination to receive your custom protocol.
              </p>
            </div>
            <EventForm onSubmit={handlePlanGenerate} isLoading={loading} />
          </div>
        )}

        {/* SCREEN 3: RESULTS & VIRTUAL FITTING STUDIO */}
        {currentScreen === "results" && data && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-pink/50 pb-4 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-brand-rose font-bold">
                  Active Consultation
                </span>
                <h2 className="text-3xl font-serif font-bold text-neutral-900">
                  Your Event Protocol & Lookbook
                </h2>
              </div>
              <button
                onClick={() => setCurrentScreen("planner")}
                className="px-4 py-2 bg-brand-light border border-brand-pink text-brand-darkRose rounded-xl text-xs font-bold hover:bg-brand-pink/30 transition"
              >
                ← Plan Another Event
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <SkinReport skin={data.skinResults} env={data.envResults} />
                <RoutineTimeline routine={data.plan.routine} />
              </div>

              <div>
                <VToStudio
                  userImageUrl={currentImage}
                  undertone={data.skinResults.undertone}
                  garments={data.plan.vtoGarmentSuggestions}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}