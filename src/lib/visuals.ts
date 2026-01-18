import { VisualAsset, TikTokScript, VisualStyle } from '@/types';
import { generateId } from './utils';

const REPLICATE_API_URL = 'https://api.replicate.com/v1';
const DEFAULT_REPLICATE_MODEL = 'black-forest-labs/flux-schnell';
const DEFAULT_REPLICATE_MIN_INTERVAL_MS = 11000;
let lastReplicateRequestAt = 0;

// Visual style presets for consistent aesthetic
export const VISUAL_STYLE_CONFIGS: Record<VisualStyle, {
  basePrompt: string;
  negativeElements: string;
  colorPalette: string;
}> = {
  abstract_data_visualization: {
    basePrompt: 'Abstract data visualization, flowing luminescent data streams, neural network patterns, glowing interconnected nodes, digital particles flowing through space',
    negativeElements: 'text, words, letters, numbers, labels, watermarks',
    colorPalette: 'deep blue, electric cyan, soft purple, white accents',
  },
  solarpunk_technology: {
    basePrompt: 'Solarpunk technology aesthetic, organic circuits integrated with nature, bioluminescent plants, sustainable green technology, harmonious future',
    negativeElements: 'dystopian, dark, polluted, text, words, labels',
    colorPalette: 'vibrant green, warm gold, soft white, natural earth tones',
  },
  holographic_interface: {
    basePrompt: 'Futuristic holographic interface, transparent floating displays, volumetric projections, sleek command center, ambient glow',
    negativeElements: 'cluttered, messy, text, readable words, labels',
    colorPalette: 'cyan, electric blue, soft white, subtle purple',
  },
  human_ai_interaction: {
    basePrompt: 'Empathetic human-AI collaboration scene, humans and AI working together, warm lighting, hopeful atmosphere, connection and understanding',
    negativeElements: 'scary robots, threatening, dark, dystopian, text, words',
    colorPalette: 'warm amber, soft blue, white, natural skin tones',
  },
  research_lab_aesthetic: {
    basePrompt: 'Clean modern research laboratory, scientific discovery moment, advanced equipment, breakthrough atmosphere, professional yet exciting',
    negativeElements: 'messy, chaotic, scary, dark, text, labels, signs',
    colorPalette: 'clean white, soft blue, silver, accent colors',
  },
};

export async function generateVisualAsset(
  theme: string,
  style: VisualStyle,
  scriptId: string,
  sequence: number
): Promise<VisualAsset> {
  const styleConfig = VISUAL_STYLE_CONFIGS[style];

  const prompt = buildFluxPrompt(theme, styleConfig);

  try {
    const imageUrl = await generateWithReplicate(prompt, styleConfig.negativeElements);

    return {
      id: generateId(),
      scriptId,
      prompt,
      style,
      imageUrl,
      sequence,
      theme,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate visual asset');
  }
}

function buildFluxPrompt(theme: string, styleConfig: typeof VISUAL_STYLE_CONFIGS[VisualStyle]): string {
  return `Cinematic, ultra-high quality digital art. ${styleConfig.basePrompt}.

Scene concept: ${theme}

Style requirements:
- Color palette: ${styleConfig.colorPalette}
- Premium, research-backed aesthetic
- Hopeful and empowering mood
- 16:9 aspect ratio composition
- Dramatic cinematic lighting
- Shallow depth of field with bokeh
- Photorealistic with subtle artistic abstraction

IMPORTANT: Absolutely no ${styleConfig.negativeElements}. The image must be clean and text-free.`;
}

interface ReplicatePredictionResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[] | string | null;
  error?: string | null;
  urls?: {
    get?: string;
  };
}

async function generateWithReplicate(prompt: string, negativePrompt: string): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken || apiToken === 'your_replicate_api_token_here') {
    throw new Error('Replicate API key not configured. Add REPLICATE_API_TOKEN to .env.local');
  }

  const model = process.env.REPLICATE_MODEL || DEFAULT_REPLICATE_MODEL;
  const startData = await createReplicatePrediction(apiToken, model, prompt, negativePrompt);
  const predictionUrl = startData.urls?.get || `${REPLICATE_API_URL}/predictions/${startData.id}`;
  const finalData = await pollReplicatePrediction(predictionUrl, apiToken);
  const output = finalData.output;
  const imageUrl = Array.isArray(output) ? output[0] : output;

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('No image URL returned from Replicate');
  }

  return imageUrl;
}

async function createReplicatePrediction(
  apiToken: string,
  model: string,
  prompt: string,
  negativePrompt: string
): Promise<ReplicatePredictionResponse> {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await enforceReplicateInterval();
    const startResponse = await fetch(`${REPLICATE_API_URL}/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio: '16:9',
          num_outputs: 1,
          output_format: 'png',
          output_quality: 85,
        },
      }),
    });

    if (startResponse.ok) {
      return await startResponse.json() as ReplicatePredictionResponse;
    }

    if (startResponse.status === 429 && attempt < maxAttempts - 1) {
      const retryAfterMs = await getRetryAfterMs(startResponse);
      await sleep(retryAfterMs);
      continue;
    }

    const message = await startResponse.text();
    throw new Error(`Replicate request failed: ${startResponse.status} ${message}`);
  }

  throw new Error('Replicate request failed after retries');
}

async function pollReplicatePrediction(url: string, apiToken: string): Promise<ReplicatePredictionResponse> {
  const maxAttempts = 30;
  const delayMs = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${apiToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 429 && attempt < maxAttempts - 1) {
        const retryAfterMs = await getRetryAfterMs(response);
        await sleep(retryAfterMs);
        continue;
      }
      const message = await response.text();
      throw new Error(`Replicate status failed: ${response.status} ${message}`);
    }

    const data = await response.json() as ReplicatePredictionResponse;
    if (data.status === 'succeeded') {
      return data;
    }
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(data.error || 'Replicate prediction failed');
    }

    await sleep(delayMs);
  }

  throw new Error('Replicate prediction timed out');
}

async function enforceReplicateInterval() {
  const minIntervalMs = Number(process.env.REPLICATE_MIN_INTERVAL_MS || DEFAULT_REPLICATE_MIN_INTERVAL_MS);
  const now = Date.now();
  const elapsed = now - lastReplicateRequestAt;
  if (elapsed < minIntervalMs) {
    await sleep(minIntervalMs - elapsed);
  }
  lastReplicateRequestAt = Date.now();
}

async function getRetryAfterMs(response: Response): Promise<number> {
  const headerRetry = response.headers.get('retry-after');
  if (headerRetry) {
    const seconds = Number(headerRetry);
    if (!Number.isNaN(seconds)) {
      return Math.max(seconds * 1000, 1000);
    }
  }

  try {
    const data = await response.clone().json() as { retry_after?: number };
    if (typeof data?.retry_after === 'number') {
      return Math.max(data.retry_after * 1000, 1000);
    }
  } catch {
    // ignore parse errors
  }

  return 6000;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateVisualSequence(
  script: TikTokScript,
  style: VisualStyle
): Promise<VisualAsset[]> {
  const themes = script.visualThemes.slice(0, 4);

  if (themes.length === 0) {
    throw new Error('No visual themes available in script');
  }

  const assets: VisualAsset[] = [];

  // Generate images sequentially to avoid rate limits
  for (let i = 0; i < themes.length; i++) {
    const asset = await generateVisualAsset(themes[i], style, script.id, i);
    assets.push(asset);

    // Small delay between requests to respect rate limits
    if (i < themes.length - 1) {
      await sleep(1000);
    }
  }

  return assets;
}

export async function regenerateVisualAsset(
  asset: VisualAsset,
  alternativeStyle?: VisualStyle
): Promise<VisualAsset> {
  const style = alternativeStyle || asset.style;
  return generateVisualAsset(asset.theme, style, asset.scriptId, asset.sequence);
}

export function getVisualStyleDescription(style: VisualStyle): string {
  const descriptions: Record<VisualStyle, string> = {
    abstract_data_visualization: 'Flowing data streams and neural network patterns with a high-tech feel',
    solarpunk_technology: 'Nature-integrated technology with an optimistic, sustainable future aesthetic',
    holographic_interface: 'Futuristic floating displays and transparent UI elements',
    human_ai_interaction: 'Warm scenes of humans and AI collaborating harmoniously',
    research_lab_aesthetic: 'Clean, professional laboratory environments capturing moments of discovery',
  };
  return descriptions[style];
}

export function recommendVisualStyle(scriptContent: string): VisualStyle {
  const content = scriptContent.toLowerCase();

  if (content.includes('data') || content.includes('algorithm') || content.includes('neural')) {
    return 'abstract_data_visualization';
  }
  if (content.includes('sustainable') || content.includes('environment') || content.includes('green')) {
    return 'solarpunk_technology';
  }
  if (content.includes('interface') || content.includes('display') || content.includes('virtual')) {
    return 'holographic_interface';
  }
  if (content.includes('collaboration') || content.includes('together') || content.includes('human')) {
    return 'human_ai_interaction';
  }
  if (content.includes('research') || content.includes('study') || content.includes('discover')) {
    return 'research_lab_aesthetic';
  }

  // Default to solarpunk for its hopeful aesthetic
  return 'solarpunk_technology';
}
