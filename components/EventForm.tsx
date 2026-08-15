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
  }) => void;
  isLoading: boolean;
}

// One-click fallback for a live demo — removes camera permissions and venue
// wifi from the critical path. These paths must exist in /public/demo/.
const DEMO_PHOTOS = [
  { path: "/demo/sample_user_portrait.jpg", label: "Demo portrait" },
  { path: "/demo/sample_user_body.jpg", label: "Demo full-body" },
];

export const EventForm: React.FC<EventFormProps> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<"upload" | "camera" | "url">("upload");
  const [userImageUrl, setUserImageUrl] = useState(DEMO_PHOTOS[0].path);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // eventType and city now come from EVENT_TYPES / SUPPORTED_CITIES (engine.ts) —
  // previously this component had its own hardcoded lists that didn't match
  // the WARDROBE_CATALOG keys, so garment matching silently fell back to
  // Owambe regardless of what was selected. Single source of truth now.
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [city, setCity] = useState(SUPPORTED_CITIES[0].name);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // 1. Handle File Upload from Media
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

  // 2. Start Live Camera
  const startCamera = async () => {
    setCameraError(null);
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
      // Graceful fallback instead of a blocking alert() — this is what saves
      // the demo if a judge's machine blocks camera permissions or has no
      // webcam. Drops straight into upload mode with a visible, calm message.
      console.error("Camera access denied:", err);
      setIsCameraActive(false);
      setCameraError(
        "Camera unavailable on this device — upload a photo or use a demo portrait below."
      );
      setActiveTab("upload");
    }
  };

  // 3. Capture Snapshot from Live Camera
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
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleUseDemoPhoto = (path: string) => {
    stopCamera();
    setCameraError(null);
    setPreviewUrl(path);
    setUserImageUrl(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopCamera();
    const coords = SUPPORTED_CITIES.find((c) => c.name === city) ?? SUPPORTED_CITIES[0];
    onSubmit({
      userImageUrl: previewUrl || userImageUrl,
      eventType,
      latitude: coords.lat,
      longitude: coords.lon,
    });
  };

  return (
    <div className="bg-white border border-brand-pink/60 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_-30px_rgba(45,24,18,0.35)] max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-rose font-bold">Step 1</span>
          <h2 className="text-2xl font-bold text-brand-darkRose">Event & Portrait Input</h2>
        </div>
        <div className="flex bg-brand-light p-1 rounded-2xl border border-brand-pink/50">
          <button
            type="button"
            onClick={() => { setActiveTab("upload"); stopCamera(); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === "upload" ? "bg-brand-rose text-white shadow-sm" : "text-neutral-600"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("camera"); startCamera(); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === "camera" ? "bg-brand-rose text-white shadow-sm" : "text-neutral-600"
            }`}
          >
            Take Selfie
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("url"); stopCamera(); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              activeTab === "url" ? "bg-brand-rose text-white shadow-sm" : "text-neutral-600"
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Input Modes */}
        <div className="bg-brand-light/60 p-4 rounded-2xl border border-brand-pink/40 flex flex-col items-center justify-center min-h-[220px]">
          {activeTab === "upload" && (
            <div className="w-full text-center">
              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-28 h-28 object-cover rounded-2xl border-2 border-brand-rose shadow-md"
                  />
                  <label className="cursor-pointer text-xs font-semibold text-brand-darkRose hover:underline">
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-pink rounded-2xl hover:bg-brand-pink/20 transition w-full">
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-sm font-semibold text-brand-darkRose">Upload from Device Gallery</span>
                  <span className="text-xs text-neutral-500 mt-1">PNG, JPG or WebP</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
              {cameraError && (
                <p className="mt-3 text-xs text-brand-darkRose/70">{cameraError}</p>
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
                    className="w-48 h-48 rounded-2xl object-cover border-2 border-brand-rose shadow-md"
                  />
                  <button
                    type="button"
                    onClick={captureSelfie}
                    className="px-5 py-2 bg-brand-rose hover:bg-brand-darkRose text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Capture Snapshot
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={previewUrl || userImageUrl}
                    alt="Captured Selfie"
                    className="w-28 h-28 object-cover rounded-2xl border-2 border-brand-rose shadow-md"
                  />
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-brand-pink/60 hover:bg-brand-pink text-brand-darkRose text-xs font-semibold rounded-xl transition"
                  >
                    Retake Live Selfie
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "url" && (
            <div className="w-full space-y-2">
              <label className="block text-xs font-semibold text-neutral-600">PHOTO WEB LINK</label>
              <input
                type="url"
                value={userImageUrl}
                onChange={(e) => {
                  setUserImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                className="w-full px-4 py-2.5 bg-white border border-brand-pink rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose"
                placeholder="https://..."
              />
            </div>
          )}
        </div>

        {/* Quick start — demo photos, always visible regardless of active tab.
            This is the highest-ROI safety net for a live demo: one click
            bypasses camera permissions and file pickers entirely. */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
              Quick start
            </span>
            <div className="h-px flex-1 bg-brand-pink/40" />
          </div>
          <div className="flex gap-3">
            {DEMO_PHOTOS.map((photo) => (
              <button
                key={photo.path}
                type="button"
                onClick={() => handleUseDemoPhoto(photo.path)}
                className="group flex-1 overflow-hidden rounded-xl border border-brand-pink/50 transition-shadow hover:shadow-md"
              >
                <img src={photo.path} alt={photo.label} className="h-16 w-full object-cover" />
                <span className="block bg-brand-light py-1.5 text-[11px] font-semibold text-neutral-600 group-hover:text-brand-darkRose transition">
                  {photo.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Event Type & Destination City — sourced from engine.ts so the
            selected values always match WARDROBE_CATALOG keys and real coords. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">OCCASION / EVENT</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-brand-pink rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">DESTINATION CITY</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-brand-pink rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose"
            >
              {SUPPORTED_CITIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}, {c.country}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-brand-rose hover:bg-brand-darkRose text-white font-semibold rounded-2xl text-sm transition-all duration-200 shadow-md shadow-brand-rose/20 hover:shadow-lg hover:shadow-brand-rose/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? "Analyzing Skin & Synthesizing Lookbook..." : "Generate AuraFit Protocol"}
        </button>
      </form>
    </div>
  );
};
