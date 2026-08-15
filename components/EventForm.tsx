// src/components/EventForm.tsx
"use client";

import React, { useState, useRef } from "react";
import { SUPPORTED_CITIES, EVENT_TYPES } from "@/lib/engine";

interface EventFormProps {
  onSubmit: (data: {
    userImageUrl: string;
    eventType: string;
    latitude: number;
    longitude: number;
    cityName: string;
  }) => void;
  isLoading: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<"upload" | "camera" | "url">("upload");
  // Default dark skin demo portrait
  const [userImageUrl, setUserImageUrl] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState(EVENT_TYPES[0]);
  const [selectedCity, setSelectedCity] = useState(SUPPORTED_CITIES[0].name);

  // Camera Refs & State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        setUserImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Unable to access camera. Please check device permissions.");
      setIsCameraActive(false);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 640;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPreviewUrl(dataUrl);
        setUserImageUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopCamera();
    const cityData = SUPPORTED_CITIES.find((c) => c.name === selectedCity) || SUPPORTED_CITIES[0];
    onSubmit({
      userImageUrl: previewUrl || userImageUrl,
      eventType: selectedEvent,
      latitude: cityData.lat,
      longitude: cityData.lon,
      cityName: `${cityData.name}, ${cityData.country}`,
    });
  };

  return (
    <div className="bg-brand-surface border-2 border-brand-pink rounded-3xl p-6 md:p-8 shadow-md max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-terracotta font-bold">
            Step 1 • Portrait & Destination
          </span>
          <h2 className="text-2xl font-bold text-brand-espresso">Configure Consultation</h2>
        </div>
        <div className="flex bg-brand-blush p-1 rounded-2xl border border-brand-pink self-start">
          <button
            type="button"
            onClick={() => { setActiveTab("upload"); stopCamera(); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === "upload" ? "bg-brand-espresso text-white shadow-xs" : "text-brand-mocha"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("camera"); startCamera(); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === "camera" ? "bg-brand-espresso text-white shadow-xs" : "text-brand-mocha"
            }`}
          >
            Live Selfie
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("url"); stopCamera(); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
              activeTab === "url" ? "bg-brand-espresso text-white shadow-xs" : "text-brand-mocha"
            }`}
          >
            URL
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Mode Frame */}
        <div className="bg-brand-blush/60 p-5 rounded-2xl border border-brand-pink flex flex-col items-center justify-center min-h-[220px]">
          {activeTab === "upload" && (
            <div className="w-full text-center">
              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-28 h-28 object-cover rounded-2xl border-2 border-brand-espresso shadow-md"
                  />
                  <label className="cursor-pointer text-xs font-bold text-brand-terracotta hover:underline">
                    Choose Another Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-rose/60 rounded-2xl hover:bg-brand-pink/30 transition w-full">
                  <span className="text-3xl mb-1">📷</span>
                  <span className="text-sm font-bold text-brand-espresso">Upload Portrait from Device</span>
                  <span className="text-xs text-brand-mocha mt-1">Supports All Skin Tones & Formats</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>
          )}

          {activeTab === "camera" && (
            <div className="flex flex-col items-center gap-3 w-full">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-52 h-52 rounded-2xl object-cover border-2 border-brand-espresso shadow-md"
                  />
                  <button
                    type="button"
                    onClick={captureSelfie}
                    className="px-5 py-2.5 bg-brand-espresso hover:bg-brand-mocha text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    📸 Snap Photo
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={previewUrl || userImageUrl}
                    alt="Captured Selfie"
                    className="w-28 h-28 object-cover rounded-2xl border-2 border-brand-espresso shadow-md"
                  />
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-brand-pink hover:bg-brand-rose text-brand-espresso text-xs font-bold rounded-xl transition"
                  >
                    Open Live Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "url" && (
            <div className="w-full space-y-2">
              <label className="block text-xs font-bold text-brand-espresso">IMAGE PUBLIC URL</label>
              <input
                type="url"
                value={userImageUrl}
                onChange={(e) => {
                  setUserImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                className="w-full px-4 py-2.5 bg-white border border-brand-pink rounded-xl text-sm text-brand-espresso focus:outline-none focus:ring-2 focus:ring-brand-espresso"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          )}
        </div>

        {/* Event Occasion & Multi-Country City Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1.5">OCCASION / EVENT</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-brand-pink rounded-xl text-xs font-semibold text-brand-espresso focus:ring-2 focus:ring-brand-espresso"
            >
              {EVENT_TYPES.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-espresso mb-1.5">
              DESTINATION (NIGERIA & GLOBAL)
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-brand-pink rounded-xl text-xs font-semibold text-brand-espresso focus:ring-2 focus:ring-brand-espresso"
            >
              <optgroup label="🇳🇬 Nigeria">
                {SUPPORTED_CITIES.filter((c) => c.country === "Nigeria").map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}, Nigeria
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌍 Global Destinations">
                {SUPPORTED_CITIES.filter((c) => c.country !== "Nigeria").map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-brand-espresso hover:bg-brand-mocha text-white font-bold rounded-2xl text-sm transition duration-200 shadow-md disabled:opacity-50 tracking-wide"
        >
          {isLoading ? "Running YouCam Skin AI & Weather Forecast..." : "Generate AuraFit Protocol"}
        </button>
      </form>
    </div>
  );
};