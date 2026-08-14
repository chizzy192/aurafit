import { NextRequest, NextResponse } from 'next/server';
import { analyzeSkin } from '@/lib/youcam/skin';
import { getEventWeather } from '@/lib/weather';
import { generateEventPlan } from '@/lib/engine';

export async function POST(req: NextRequest) {
  try {
    const { userImageUrl, latitude, longitude, eventType } = await req.json();

    if (!userImageUrl) {
      return NextResponse.json({ error: 'User portrait image URL is required' }, { status: 400 });
    }

    // Parallel processing: Call YouCam Skin AI and Weather Service concurrently
    const [skinResults, envResults] = await Promise.all([
      analyzeSkin(userImageUrl),
      getEventWeather(latitude || 25.7617, longitude || -80.1918), // Default: Miami
    ]);

    // Generate routine & recommendations
    const plan = generateEventPlan(skinResults, envResults, eventType || 'Special Event');

    return NextResponse.json({
      success: true,
      skinResults,
      envResults,
      plan,
    });
  } catch (error: any) {
    console.error('Event Plan Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}