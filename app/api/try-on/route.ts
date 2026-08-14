import { NextRequest, NextResponse } from 'next/server';
import { generateVirtualTryOn } from '@/lib/youcam/vto';

export async function POST(req: NextRequest) {
  try {
    const { userImageUrl, garmentImageUrl, category } = await req.json();

    if (!userImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        { error: 'Both userImageUrl and garmentImageUrl are required.' },
        { status: 400 }
      );
    }

    const resultImageUrl = await generateVirtualTryOn(
      userImageUrl,
      garmentImageUrl,
      category || 'dresses'
    );

    return NextResponse.json({
      success: true,
      resultImageUrl,
    });
  } catch (error: any) {
    console.error('Apparel VTO Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process virtual try-on.' },
      { status: 500 }
    );
  }
}