// Core types for Aegis Viral Engine

export type HookType =
  | 'provocative_question'
  | 'surprising_fact'
  | 'counter_intuitive'
  | 'future_prediction'
  | 'personal_story';

export type VisualStyle =
  | 'abstract_data_visualization'
  | 'solarpunk_technology'
  | 'holographic_interface'
  | 'human_ai_interaction'
  | 'research_lab_aesthetic';

export type PostStatus = 'draft' | 'approved' | 'published' | 'archived';

export interface ResearchSource {
  id: string;
  url: string;
  title: string;
  domain: string;
  markdown: string;
  publishedDate?: string;
  authors?: string[];
  credibilityScore: number;
  fetchedAt: string;
}

export interface ResearchSummary {
  id: string;
  sources: ResearchSource[];
  topic: string;
  keyFindings: string[];
  ethicalImplications: string[];
  potentialHooks: string[];
  createdAt: string;
}

export interface ScriptSection {
  type: 'hook' | 'unlock' | 'cta';
  startTime: number;
  endTime: number;
  text: string;
  speakerNotes?: string;
}

export interface TikTokScript {
  id: string;
  researchSummaryId: string;
  title: string;
  hookType: HookType;
  sections: ScriptSection[];
  fullText: string;
  targetAudience: string;
  estimatedDuration: number;
  visualThemes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AudioAsset {
  id: string;
  scriptId: string;
  voiceId: string;
  voiceName: string;
  audioUrl: string;
  duration: number;
  createdAt: string;
}

export interface VisualAsset {
  id: string;
  scriptId: string;
  prompt: string;
  style: VisualStyle;
  imageUrl: string;
  sequence: number;
  theme: string;
  createdAt: string;
}

export interface Post {
  id: string;
  scriptId: string;
  script: TikTokScript;
  audioAsset?: AudioAsset;
  visualAssets: VisualAsset[];
  status: PostStatus;
  researchSource: string;
  hookType: HookType;
  visualStylePrompt: VisualStyle;
  engagementMetrics?: EngagementMetrics;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementMetrics {
  postId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number;
  completionRate: number;
  engagementRate: number;
  fetchedAt: string;
}

export interface IterationRecommendation {
  postId: string;
  performancePercentile: number;
  suggestedHookType: HookType;
  suggestedVisualStyle: VisualStyle;
  reasoning: string;
  createdAt: string;
}

export interface GenerationConfig {
  topic?: string;
  hookType?: HookType;
  visualStyle?: VisualStyle;
  voiceId?: string;
  overrideEmotionalTone?: 'direct' | 'emotional' | 'balanced';
}

export interface GenerationProgress {
  step: 'research' | 'script' | 'audio' | 'visuals' | 'complete';
  progress: number;
  message: string;
}
