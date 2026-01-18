import {
  Post,
  TikTokScript,
  AudioAsset,
  VisualAsset,
  ResearchSource,
  GenerationConfig,
  GenerationProgress,
  HookType,
  VisualStyle,
} from '@/types';
import { generateId } from './utils';
import {
  searchResearch,
  getRandomTopic,
  filterAcademicSources,
  persistResearchSummary,
} from './research';
import { generateScript, extractVisualThemes } from './scripting';
import { generateVoiceover, DEFAULT_VOICE } from './audio';
import { generateVisualSequence, recommendVisualStyle } from './visuals';
import { supabaseAdmin } from './supabase';
import { logActivity } from './activity';

export type ProgressCallback = (progress: GenerationProgress) => void;

export interface GenerationResult {
  topic: string;
  sources: ResearchSource[];
  post: Post;
  script: TikTokScript;
  audioAsset: AudioAsset;
  visualAssets: VisualAsset[];
}

export async function generateViralContent(
  config: GenerationConfig = {},
  onProgress?: ProgressCallback
): Promise<GenerationResult> {
  const updateProgress = (
    step: GenerationProgress['step'],
    progress: number,
    message: string
  ) => {
    onProgress?.({ step, progress, message });
  };

  // Step 1: Research Phase
  updateProgress('research', 0, 'Searching for peer-reviewed research...');

  const topic = config.topic || getRandomTopic();
  const sources = await searchResearch(topic);
  const academicSources = filterAcademicSources(sources);

  if (academicSources.length === 0) {
    throw new Error('No credible academic sources found for this topic');
  }

  updateProgress('research', 100, `Found ${academicSources.length} academic sources`);

  // Step 2: Script Generation
  updateProgress('script', 0, 'Generating TikTok script with Claude...');

  const hookType = config.hookType || 'surprising_fact';
  const script = await generateScript(
    academicSources,
    hookType,
    config.overrideEmotionalTone
  );

  // Ensure we have visual themes
  if (script.visualThemes.length < 3) {
    script.visualThemes = await extractVisualThemes(script);
  }

  updateProgress('script', 100, 'Script generated successfully');

  // Step 3: Audio Generation
  updateProgress('audio', 0, 'Generating voiceover with ElevenLabs...');

  const voiceId = config.voiceId || DEFAULT_VOICE.id;
  const audioAsset = await generateVoiceover(script, voiceId);

  updateProgress('audio', 100, 'Voiceover generated successfully');

  // Step 4: Visual Generation
  updateProgress('visuals', 0, 'Generating visuals with FLUX...');

  const visualStyle = config.visualStyle || recommendVisualStyle(script.fullText);
  const visualAssets = await generateVisualSequence(script, visualStyle);

  updateProgress('visuals', 100, `Generated ${visualAssets.length} visual assets`);

  // Step 5: Create Post
  updateProgress('complete', 0, 'Creating post...');

  const post: Post = {
    id: generateId(),
    scriptId: script.id,
    script,
    audioAsset,
    visualAssets,
    status: 'draft',
    researchSource: academicSources[0].url,
    hookType,
    visualStylePrompt: visualStyle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  updateProgress('complete', 100, 'Content generation complete!');

  return {
    topic,
    sources: academicSources,
    post,
    script,
    audioAsset,
    visualAssets,
  };
}

export async function saveGeneratedContent(result: GenerationResult): Promise<void> {
  const { post, script, audioAsset, visualAssets, topic, sources } = result;

  const researchSummaryId = await persistResearchSummary(topic, sources);

  // Save script
  const { error: scriptError } = await supabaseAdmin.from('scripts').insert({
    id: script.id,
    research_summary_id: researchSummaryId,
    title: script.title,
    hook_type: script.hookType,
    sections: script.sections,
    full_text: script.fullText,
    target_audience: script.targetAudience,
    estimated_duration: script.estimatedDuration,
    visual_themes: script.visualThemes,
  });
  if (scriptError) {
    throw new Error(`Failed to save script: ${scriptError.message}`);
  }

  // Save audio asset
  const { error: audioError } = await supabaseAdmin.from('audio_assets').insert({
    id: audioAsset.id,
    script_id: audioAsset.scriptId,
    voice_id: audioAsset.voiceId,
    voice_name: audioAsset.voiceName,
    audio_url: audioAsset.audioUrl,
    duration: audioAsset.duration,
  });
  if (audioError) {
    throw new Error(`Failed to save audio asset: ${audioError.message}`);
  }

  // Save visual assets
  for (const visual of visualAssets) {
    const { error: visualError } = await supabaseAdmin.from('visual_assets').insert({
      id: visual.id,
      script_id: visual.scriptId,
      prompt: visual.prompt,
      style: visual.style,
      image_url: visual.imageUrl,
      sequence: visual.sequence,
      theme: visual.theme,
    });
    if (visualError) {
      throw new Error(`Failed to save visual asset: ${visualError.message}`);
    }
  }

  // Save post
  const { error: postError } = await supabaseAdmin.from('posts').insert({
    id: post.id,
    script_id: post.scriptId,
    status: post.status,
    research_source: post.researchSource,
    hook_type: post.hookType,
    visual_style_prompt: post.visualStylePrompt,
  });
  if (postError) {
    throw new Error(`Failed to save post: ${postError.message}`);
  }

  await logActivity({
    eventType: 'content.saved',
    entityType: 'post',
    entityId: post.id,
    metadata: {
      scriptId: script.id,
      audioAssetId: audioAsset.id,
      visualAssetCount: visualAssets.length,
      researchSummaryId,
    },
  });
}

export async function loadPost(postId: string): Promise<Post | null> {
  const { data: postData, error } = await supabaseAdmin
    .from('posts')
    .select(`
      *,
      scripts (*),
      audio_assets (*),
      visual_assets (*),
      engagement_metrics (*)
    `)
    .eq('id', postId)
    .single();

  if (error || !postData) {
    return null;
  }

  const scriptData = Array.isArray(postData.scripts)
    ? postData.scripts[0]
    : postData.scripts;

  if (!scriptData) {
    return null;
  }

  return {
    id: postData.id,
    scriptId: postData.script_id,
    script: {
      id: scriptData.id,
      researchSummaryId: '',
      title: scriptData.title,
      hookType: scriptData.hook_type as HookType,
      sections: scriptData.sections,
      fullText: scriptData.full_text,
      targetAudience: scriptData.target_audience,
      estimatedDuration: scriptData.estimated_duration,
      visualThemes: scriptData.visual_themes,
      createdAt: scriptData.created_at,
      updatedAt: scriptData.updated_at,
    },
    audioAsset: postData.audio_assets?.[0]
      ? {
          id: postData.audio_assets[0].id,
          scriptId: postData.audio_assets[0].script_id,
          voiceId: postData.audio_assets[0].voice_id,
          voiceName: postData.audio_assets[0].voice_name,
          audioUrl: postData.audio_assets[0].audio_url,
          duration: postData.audio_assets[0].duration,
          createdAt: postData.audio_assets[0].created_at,
        }
      : undefined,
    visualAssets: (postData.visual_assets || []).map((v: Record<string, unknown>) => ({
      id: v.id,
      scriptId: v.script_id,
      prompt: v.prompt,
      style: v.style as VisualStyle,
      imageUrl: v.image_url,
      sequence: v.sequence,
      theme: v.theme,
      createdAt: v.created_at,
    })),
    status: postData.status,
    researchSource: postData.research_source,
    hookType: postData.hook_type as HookType,
    visualStylePrompt: postData.visual_style_prompt as VisualStyle,
    engagementMetrics: postData.engagement_metrics?.[0],
    publishedAt: postData.published_at,
    createdAt: postData.created_at,
    updatedAt: postData.updated_at,
  };
}

export async function listPosts(
  status?: Post['status'],
  limit: number = 20
): Promise<Post[]> {
  let query = supabaseAdmin
    .from('posts')
    .select(`
      *,
      scripts (*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((postData: Record<string, unknown>) => ({
    id: postData.id,
    scriptId: postData.script_id,
    script: postData.scripts
      ? {
          id: (postData.scripts as Record<string, unknown>).id,
          researchSummaryId: '',
          title: (postData.scripts as Record<string, unknown>).title,
          hookType: (postData.scripts as Record<string, unknown>).hook_type as HookType,
          sections: (postData.scripts as Record<string, unknown>).sections,
          fullText: (postData.scripts as Record<string, unknown>).full_text,
          targetAudience: (postData.scripts as Record<string, unknown>).target_audience,
          estimatedDuration: (postData.scripts as Record<string, unknown>).estimated_duration,
          visualThemes: (postData.scripts as Record<string, unknown>).visual_themes,
          createdAt: (postData.scripts as Record<string, unknown>).created_at,
          updatedAt: (postData.scripts as Record<string, unknown>).updated_at,
        }
      : undefined,
    visualAssets: [],
    status: postData.status,
    researchSource: postData.research_source,
    hookType: postData.hook_type as HookType,
    visualStylePrompt: postData.visual_style_prompt as VisualStyle,
    publishedAt: postData.published_at,
    createdAt: postData.created_at,
    updatedAt: postData.updated_at,
  })) as Post[];
}

export async function updatePostStatus(
  postId: string,
  status: Post['status']
): Promise<void> {
  const updateData: Record<string, unknown> = { status };

  if (status === 'published') {
    updateData.published_at = new Date().toISOString();
  }

  await supabaseAdmin.from('posts').update(updateData).eq('id', postId);

  await logActivity({
    eventType: 'post.status_updated',
    entityType: 'post',
    entityId: postId,
    metadata: { status },
  });
}

export async function updatePostContent({
  postId,
  scriptId,
  sections,
  fullText,
  visuals,
}: {
  postId: string;
  scriptId?: string;
  sections?: TikTokScript['sections'];
  fullText?: string;
  visuals?: Array<{ id: string; sequence: number }>;
}): Promise<void> {
  let resolvedScriptId = scriptId;

  if (!resolvedScriptId) {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('script_id')
      .eq('id', postId)
      .single();

    if (error || !data?.script_id) {
      throw new Error('Unable to resolve script for post update');
    }

    resolvedScriptId = data.script_id;
  }

  const scriptUpdates: Record<string, unknown> = {};
  if (sections) {
    scriptUpdates.sections = sections;
  }
  if (fullText) {
    scriptUpdates.full_text = fullText;
  }

  if (Object.keys(scriptUpdates).length > 0) {
    const { error: scriptError } = await supabaseAdmin
      .from('scripts')
      .update(scriptUpdates)
      .eq('id', resolvedScriptId);

    if (scriptError) {
      throw new Error(`Failed to update script: ${scriptError.message}`);
    }
  }

  if (visuals && visuals.length > 0) {
    for (const visual of visuals) {
      const { error: visualError } = await supabaseAdmin
        .from('visual_assets')
        .update({ sequence: visual.sequence })
        .eq('id', visual.id);

      if (visualError) {
        throw new Error(`Failed to update visual order: ${visualError.message}`);
      }
    }
  }

  await logActivity({
    eventType: 'post.updated',
    entityType: 'post',
    entityId: postId,
    metadata: {
      scriptId: resolvedScriptId,
      sectionsUpdated: Boolean(sections),
      visualsUpdated: visuals ? visuals.length : 0,
    },
  });
}
