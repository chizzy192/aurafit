"use client";

import React, { useState } from "react";

interface EventFormProps {
  onSubmit: (data: {
    userImageUrl: string;
    eventType: string;
    latitude: number;
    longitude: number;
  }) => void;
  isLoading: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({ onSubmit, isLoading }) => {
  const [userImageUrl, setUserImageUrl] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
  );
  const [eventType, setEventType] = useState("Beach Wedding");
  const [city, setCity] = useState("Miami, FL");

  // Approximate default coordinates for quick presets
  const cityCoordinates: Record<string, { lat: number; lon: number }> = {
    "Miami, FL": { lat: 25.7617, lon: -80.1918 },
    "New York, NY": { lat: 40.7128, lon: -74.006 },
    "Paris, France": { lat: 48.8566, lon: 2.3522 },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coords = cityCoordinates[city] || { lat: 25.7617, lon: -80.1918 };
    onSubmit({
      userImageUrl,
      eventType,
      latitude: coords.lat,
      longitude: coords.lon,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-brand-surface border border-brand-pink/60 p-6 rounded-2xl shadow-sm space-y-4 max-w-xl mx-auto"
    >
      <h2 className="text-xl font-semibold text-brand-darkRose">
        Plan Your Event Aura
      </h2>

      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1">
          USER PORTRAIT / PHOTO URL
        </label>
        <input
          type="url"
          value={userImageUrl}
          onChange={(e) => setUserImageUrl(e.target.value)}
          required
          className="w-full px-4 py-2 border border-brand-pink rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-rose"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            EVENT TYPE
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full px-3 py-2 border border-brand-pink rounded-xl text-sm bg-white focus:ring-2 focus:ring-brand-rose"
          >
            <option value="Beach Wedding">Beach Wedding</option>
            <option value="Gala / Red Carpet">Gala / Red Carpet</option>
            <option value="Job Interview">Job Interview</option>
            <option value="Outdoor Festival">Outdoor Festival</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            DESTINATION CITY
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-brand-pink rounded-xl text-sm bg-white focus:ring-2 focus:ring-brand-rose"
          >
            <option value="Miami, FL">Miami, FL (High UV)</option>
            <option value="New York, NY">New York, NY</option>
            <option value="Paris, France">Paris, France</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-brand-rose hover:bg-brand-darkRose text-white font-medium rounded-xl transition duration-200 shadow disabled:opacity-50"
      >
        {isLoading ? "Running AI Diagnosis & VTO..." : "Generate AuraFit Plan"}
      </button>
    </form>
  );
};