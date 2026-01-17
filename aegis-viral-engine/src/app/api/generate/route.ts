import { NextRequest, NextResponse } from 'next/server';
import { generateViralContent, saveGeneratedContent } from '@/lib/engine';
import { GenerationConfig } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config: GenerationConfig = {
      topic: body.topic,
      hookType: body.hookType,
      visualStyle: body.visualStyle,
      voiceId: body.voiceId,
      overrideEmotionalTone: body.emotionalTone,
    };

    const result = await generateViralContent(config);

    // Optionally save to database
    if (body.save !== false) {
      await saveGeneratedContent(result);
    }

    return NextResponse.json({
      success: true,
      data: {
        postId: result.post.id,
        title: result.script.title,
        script: {
          hook: result.script.sections.find((s) => s.type === 'hook')?.text,
          unlock: result.script.sections.find((s) => s.type === 'unlock')?.text,
          cta: result.script.sections.find((s) => s.type === 'cta')?.text,
          fullText: result.script.fullText,
        },
        audioUrl: result.audioAsset.audioUrl,
        visualAssets: result.visualAssets.map((v) => ({
          id: v.id,
          imageUrl: v.imageUrl,
          theme: v.theme,
          sequence: v.sequence,
        })),
        researchSource: result.post.researchSource,
      },
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content',
      },
      { status: 500 }
    );
  }
}
