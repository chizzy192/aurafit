// src/app/api/try-on/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateVirtualTryOn } from '@/lib/youcam/vto';

export async function POST(req: NextRequest) {
  try {
    const { userImageUrl, garmentImageUrl, garmentCategory } = await req.json();

    if (!userImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        { error: 'Both userImageUrl and garmentImageUrl are required.' },
        { status: 400 }
      );
    }

    const resultImageUrl = await generateVirtualTryOn(
      userImageUrl,
      garmentImageUrl,
      garmentCategory || 'full_body'
    );

    return NextResponse.json({
      success: true,
      resultImageUrl,
    });
  } catch (error: any) {
    console.error('Apparel VTO Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process virtual try-on.' },
      { status: 500 }
    );
  }
}