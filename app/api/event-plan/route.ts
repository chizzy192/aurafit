// src/app/api/event-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeSkin } from '@/lib/youcam/skin';
import { getEventWeather } from '@/lib/weather';
import { generateEventPlan } from '@/lib/engine';

export async function POST(req: NextRequest) {
  try {
    const { userImageUrl, latitude, longitude, eventType, cityName } = await req.json();

    if (!userImageUrl) {
      return NextResponse.json({ error: 'User portrait is required' }, { status: 400 });
    }

    // Run YouCam Skin AI & Weather API concurrently
    const [skinResults, envResults] = await Promise.all([
      analyzeSkin(userImageUrl),
      getEventWeather(latitude || 6.5244, longitude || 3.3792), // Default: Lagos, Nigeria
    ]);

    // Build personalized protocol
    const plan = generateEventPlan(skinResults, envResults, eventType || 'Owambe Wedding');

    return NextResponse.json({
      success: true,
      skinResults,
      envResults: {
        ...envResults,
        cityName: cityName || 'Lagos, Nigeria',
      },
      plan,
    });
  } catch (error: unknown) {
    console.error('Event Plan Error:', error);
    const message = error instanceof Error ? error.message : 'Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}