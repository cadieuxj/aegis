import { NextRequest, NextResponse } from 'next/server';
import {
  generateLogo,
  generateLogoVariations,
  LogoGenerationOptions,
} from '@/lib/logo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { options, generateVariations } = body as {
      options?: LogoGenerationOptions;
      generateVariations?: boolean;
    };

    if (generateVariations) {
      const logos = await generateLogoVariations(options);
      return NextResponse.json({ success: true, logos });
    }

    const logo = await generateLogo(options);
    return NextResponse.json({ success: true, logo });
  } catch (error) {
    console.error('Logo generation error:', error);
    const message = error instanceof Error ? error.message : 'Logo generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
