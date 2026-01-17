import OpenAI from 'openai';
import { VisualAsset, TikTokScript, VisualStyle } from '@/types';
import { generateId } from './utils';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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

  const prompt = buildDallEPrompt(theme, styleConfig);

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024', // 16:9 aspect ratio for video
      quality: 'hd',
      style: 'vivid',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

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

function buildDallEPrompt(theme: string, styleConfig: typeof VISUAL_STYLE_CONFIGS[VisualStyle]): string {
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
