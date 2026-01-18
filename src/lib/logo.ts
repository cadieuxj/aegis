import { generateId } from './utils';

const REPLICATE_API_URL = 'https://api.replicate.com/v1';
const DEFAULT_REPLICATE_MODEL = 'black-forest-labs/flux-1.1-pro';
const DEFAULT_REPLICATE_MIN_INTERVAL_MS = 11000;
let lastReplicateRequestAt = 0;

export type LogoTheme = 'ai_ethics' | 'human_ai' | 'shield' | 'balance';
export type LogoStyle = 'minimalist' | 'abstract' | 'symbolic';
export type ColorScheme = 'cyan_blue' | 'green_gold' | 'purple_white';

export interface LogoGenerationOptions {
  theme?: LogoTheme;
  style?: LogoStyle;
  colorScheme?: ColorScheme;
}

export interface GeneratedLogo {
  id: string;
  imageUrl: string;
  prompt: string;
  options: LogoGenerationOptions;
  createdAt: string;
}

const LOGO_THEMES: Record<LogoTheme, { elements: string; mood: string }> = {
  ai_ethics: {
    elements: 'balanced scales with one side showing a human silhouette and the other showing circuit patterns, olive branch elements, harmony symbol',
    mood: 'trustworthy, ethical, balanced, wise',
  },
  human_ai: {
    elements: 'human hand and robotic hand reaching toward each other forming a handshake or connection, glowing connection point, bridge or unity symbol',
    mood: 'collaborative, hopeful, unified, compassionate',
  },
  shield: {
    elements: 'protective shield shape with subtle circuit patterns integrated into the design, shield containing both organic and digital elements symbolizing protection of humanity',
    mood: 'protective, strong, responsible, guardian-like',
  },
  balance: {
    elements: 'yin-yang inspired circular design with human creativity elements on one side and AI logic elements on the other, flowing harmony symbol',
    mood: 'balanced, harmonious, philosophical, serene',
  },
};

const LOGO_STYLES: Record<LogoStyle, string> = {
  minimalist: 'Clean minimalist design, simple geometric shapes, no clutter, flat design with subtle gradients, highly recognizable silhouette',
  abstract: 'Abstract artistic representation, modern geometric interpretation, artistic curves and shapes, creative visual metaphor',
  symbolic: 'Symbolic iconography, meaningful imagery that tells a story, recognizable at very small sizes, strong visual identity',
};

const COLOR_SCHEMES: Record<ColorScheme, { palette: string; background: string }> = {
  cyan_blue: {
    palette: 'deep cyan (#06b6d4), electric blue (#3b82f6), clean white (#ffffff), subtle navy accents',
    background: 'dark slate (#0f172a) or transparent',
  },
  green_gold: {
    palette: 'sustainable emerald green (#22c55e), warm gold (#eab308), off-white (#fafaf9), earth tones',
    background: 'dark forest (#052e16) or transparent',
  },
  purple_white: {
    palette: 'soft purple (#a855f7), lavender (#c4b5fd), pure white (#ffffff), violet accents',
    background: 'deep purple (#2e1065) or transparent',
  },
};

function buildLogoPrompt(options: LogoGenerationOptions): string {
  const theme = options.theme || 'ai_ethics';
  const style = options.style || 'minimalist';
  const colorScheme = options.colorScheme || 'cyan_blue';

  const themeConfig = LOGO_THEMES[theme];
  const styleDescription = LOGO_STYLES[style];
  const colorConfig = COLOR_SCHEMES[colorScheme];

  return `Professional app logo icon design for an "AI Ethics for Good" brand focused on the ethical and humanitarian use of artificial intelligence.

DESIGN CONCEPT:
${themeConfig.elements}

STYLE:
${styleDescription}

COLOR PALETTE:
${colorConfig.palette}
Background: ${colorConfig.background}

MOOD AND FEELING:
${themeConfig.mood}

TECHNICAL REQUIREMENTS:
- Perfect square 1:1 aspect ratio
- Icon must work at 162x162 pixels with content in 144x144 pixel safe area
- Clean edges suitable for rounded corners (20px radius at 162px)
- Centered composition with adequate padding on all sides
- NO TEXT, NO LETTERS, NO WORDS - pure icon design only
- Must be instantly recognizable as a unique brand mark
- Professional quality suitable for app stores and developer portals

CRITICAL REQUIREMENTS:
- Must be a COMPLETELY ORIGINAL design
- Must NOT resemble TikTok, Instagram, Facebook, Twitter, Meta, Google, Apple, Microsoft, OpenAI, or any other major tech company logos
- Must NOT include any recognizable brand elements or trademarks
- Should convey ethical AI and human-centered technology
- Icon only, no wordmark or tagline`;
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enforceReplicateInterval(): Promise<void> {
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
    const data = (await response.clone().json()) as { retry_after?: number };
    if (typeof data?.retry_after === 'number') {
      return Math.max(data.retry_after * 1000, 1000);
    }
  } catch {
    // ignore parse errors
  }

  return 6000;
}

async function createReplicatePrediction(
  apiToken: string,
  model: string,
  prompt: string
): Promise<ReplicatePredictionResponse> {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await enforceReplicateInterval();

    const response = await fetch(`${REPLICATE_API_URL}/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt,
          negative_prompt:
            'text, words, letters, numbers, labels, TikTok logo, social media logos, existing brand logos, trademarked designs, blurry, low quality, complex, cluttered, watermark, signature, photograph, realistic human face',
          aspect_ratio: '1:1',
          num_outputs: 1,
          output_format: 'png',
          output_quality: 100,
        },
      }),
    });

    if (response.ok) {
      return (await response.json()) as ReplicatePredictionResponse;
    }

    if (response.status === 429 && attempt < maxAttempts - 1) {
      const retryAfterMs = await getRetryAfterMs(response);
      await sleep(retryAfterMs);
      continue;
    }

    const message = await response.text();
    throw new Error(`Replicate request failed: ${response.status} ${message}`);
  }

  throw new Error('Replicate request failed after retries');
}

async function pollReplicatePrediction(
  url: string,
  apiToken: string
): Promise<ReplicatePredictionResponse> {
  const maxAttempts = 60;
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

    const data = (await response.json()) as ReplicatePredictionResponse;
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

export async function generateLogo(options: LogoGenerationOptions = {}): Promise<GeneratedLogo> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error('Replicate API token not configured. Add REPLICATE_API_TOKEN to .env.local');
  }

  const model = process.env.REPLICATE_MODEL || DEFAULT_REPLICATE_MODEL;
  const prompt = buildLogoPrompt(options);

  const startData = await createReplicatePrediction(apiToken, model, prompt);
  const predictionUrl = startData.urls?.get || `${REPLICATE_API_URL}/predictions/${startData.id}`;
  const finalData = await pollReplicatePrediction(predictionUrl, apiToken);

  const output = finalData.output;
  const imageUrl = Array.isArray(output) ? output[0] : output;

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('No image URL returned from Replicate');
  }

  return {
    id: generateId(),
    imageUrl,
    prompt,
    options,
    createdAt: new Date().toISOString(),
  };
}

export async function generateLogoVariations(
  baseOptions: LogoGenerationOptions = {}
): Promise<GeneratedLogo[]> {
  const variations: LogoGenerationOptions[] = [
    { ...baseOptions, theme: 'ai_ethics', style: 'minimalist' },
    { ...baseOptions, theme: 'human_ai', style: 'symbolic' },
    { ...baseOptions, theme: 'shield', style: 'minimalist' },
    { ...baseOptions, theme: 'balance', style: 'abstract' },
  ];

  const results: GeneratedLogo[] = [];

  for (const options of variations) {
    const logo = await generateLogo(options);
    results.push(logo);
  }

  return results;
}

export function getLogoThemeDescription(theme: LogoTheme): string {
  const descriptions: Record<LogoTheme, string> = {
    ai_ethics: 'Balanced scales representing ethical AI decision-making and fairness',
    human_ai: 'Human and AI collaboration, connection, and partnership',
    shield: 'Protection and responsible AI guardianship',
    balance: 'Harmony between human creativity and AI capabilities',
  };
  return descriptions[theme];
}

export function getLogoStyleDescription(style: LogoStyle): string {
  const descriptions: Record<LogoStyle, string> = {
    minimalist: 'Clean, simple geometric design with high recognition',
    abstract: 'Artistic, modern interpretation with creative shapes',
    symbolic: 'Meaningful iconography that tells a visual story',
  };
  return descriptions[style];
}

export function getColorSchemeDescription(colorScheme: ColorScheme): string {
  const descriptions: Record<ColorScheme, string> = {
    cyan_blue: 'Tech-forward cyan and electric blue palette',
    green_gold: 'Sustainable green with warm gold accents',
    purple_white: 'Soft purple with clean white highlights',
  };
  return descriptions[colorScheme];
}
