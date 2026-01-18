import { NextRequest, NextResponse } from 'next/server';
import { generateViralContent, saveGeneratedContent } from '@/lib/engine';
import { logActivity } from '@/lib/activity';
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

    await logActivity({
      eventType: body.save === false ? 'content.generated' : 'content.generated_saved',
      entityType: 'post',
      entityId: result.post.id,
      metadata: {
        topic: result.topic,
        hookType: result.post.hookType,
        visualStyle: result.post.visualStylePrompt,
        saved: body.save !== false,
      },
    });

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
    const message = error instanceof Error ? error.message : 'Failed to generate content';
    await logActivity({
      eventType: 'content.generated',
      status: 'error',
      message,
      metadata: { save: true },
    });
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
