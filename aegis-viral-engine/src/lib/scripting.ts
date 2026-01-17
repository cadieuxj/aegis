import Anthropic from '@anthropic-ai/sdk';
import { ResearchSource, TikTokScript, ScriptSection, HookType, VisualStyle } from '@/types';
import { generateId } from './utils';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// Mapping hook types to their descriptions for Claude
const HOOK_TYPE_DESCRIPTIONS: Record<HookType, string> = {
  provocative_question: 'Start with a thought-provoking question that challenges assumptions',
  surprising_fact: 'Lead with a surprising statistic or fact from the research',
  counter_intuitive: 'Present a counter-intuitive finding that defies expectations',
  future_prediction: 'Make a bold prediction about the near future based on the research',
  personal_story: 'Frame the research through a relatable human story or scenario',
};

const VISUAL_STYLE_PROMPTS: Record<VisualStyle, string> = {
  abstract_data_visualization: 'flowing data streams, neural network patterns, glowing nodes and connections',
  solarpunk_technology: 'green technology, organic circuits, nature-integrated tech, optimistic future',
  holographic_interface: 'floating holographic displays, transparent UI, futuristic command center',
  human_ai_interaction: 'humans and AI working together, collaborative scenes, empathy in technology',
  research_lab_aesthetic: 'clean lab environment, scientific equipment, researchers at work, discovery moment',
};

export async function generateScript(
  sources: ResearchSource[],
  hookType: HookType = 'surprising_fact',
  overrideEmotionalTone?: 'direct' | 'emotional' | 'balanced'
): Promise<TikTokScript> {
  const sourceSummaries = sources
    .slice(0, 5)
    .map((s) => `- ${s.title} (${s.domain}): ${s.markdown?.slice(0, 500) || 'No content'}`)
    .join('\n');

  const emotionalToneInstruction = overrideEmotionalTone
    ? `Emotional Tone: ${overrideEmotionalTone.toUpperCase()} - ${
        overrideEmotionalTone === 'direct'
          ? 'Be straightforward and factual'
          : overrideEmotionalTone === 'emotional'
          ? 'Appeal to emotions and human impact'
          : 'Balance facts with emotional resonance'
      }`
    : 'Emotional Tone: BALANCED - Mix factual content with emotional resonance';

  const systemPrompt = `You are an expert viral content creator specializing in ethical AI and humanitarian technology.
Your goal is to create compelling TikTok scripts that educate and inspire while maintaining scientific accuracy.

Target Audience: North American, ages 18-35, tech-curious but skeptical. They value authenticity and are tired of hype.

Script Structure (approximately 45 seconds total):
1. HOOK (0-3 seconds): ${HOOK_TYPE_DESCRIPTIONS[hookType]}
2. THE UNLOCK (3-30 seconds): Explain the ethical AI solution clearly, citing the research concept
3. CALL TO ACTION (30-45 seconds): Encourage sharing for awareness or a specific ethical action

${emotionalToneInstruction}

Important Guidelines:
- Use conversational language, not academic jargon
- Cite specific researchers or institutions when possible (e.g., "Researchers at MIT found...")
- Focus on HOPE and ETHICAL advancement, not fear
- Make the content shareable by including surprising or empowering insights
- Keep sentences short and punchy for spoken delivery`;

  const userPrompt = `Based on the following research sources, create a TikTok script:

Research Sources:
${sourceSummaries}

Please respond with a JSON object in this exact format:
{
  "title": "A catchy title for the post",
  "hookText": "The hook text (0-3 seconds)",
  "unlockText": "The main explanation (3-30 seconds)",
  "ctaText": "The call to action (30-45 seconds)",
  "visualThemes": ["theme1", "theme2", "theme3", "theme4"],
  "keyInsight": "The main takeaway in one sentence"
}

The visualThemes should be 3-4 specific visual concepts that could be turned into images to accompany the script.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    system: systemPrompt,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Extract JSON from the response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse script response');
  }

  const scriptData = JSON.parse(jsonMatch[0]);

  const sections: ScriptSection[] = [
    {
      type: 'hook',
      startTime: 0,
      endTime: 3,
      text: scriptData.hookText,
    },
    {
      type: 'unlock',
      startTime: 3,
      endTime: 30,
      text: scriptData.unlockText,
    },
    {
      type: 'cta',
      startTime: 30,
      endTime: 45,
      text: scriptData.ctaText,
    },
  ];

  const fullText = sections.map((s) => s.text).join(' ');

  return {
    id: generateId(),
    researchSummaryId: sources[0]?.id || '',
    title: scriptData.title,
    hookType,
    sections,
    fullText,
    targetAudience: 'North American, 18-35, tech-curious',
    estimatedDuration: 45,
    visualThemes: scriptData.visualThemes || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function extractVisualThemes(script: TikTokScript): Promise<string[]> {
  if (script.visualThemes.length >= 3) {
    return script.visualThemes;
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Analyze this TikTok script and extract 4 key visual themes or metaphors that would make compelling images:

Script: "${script.fullText}"

Respond with a JSON array of 4 strings, each describing a visual concept:
["visual concept 1", "visual concept 2", "visual concept 3", "visual concept 4"]`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return script.visualThemes;
  }

  const arrayMatch = content.text.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    return script.visualThemes;
  }

  return JSON.parse(arrayMatch[0]);
}

export async function generateImagePrompts(
  themes: string[],
  style: VisualStyle
): Promise<string[]> {
  const styleDescription = VISUAL_STYLE_PROMPTS[style];

  return themes.map((theme) => {
    return `Cinematic, ultra high quality, ${styleDescription}. Scene: ${theme}.
Style: Premium, research-backed aesthetic, hopeful and empowering.
Technical: 16:9 aspect ratio, dramatic lighting, shallow depth of field,
photorealistic with subtle abstract elements. No text or words in the image.`;
  });
}

export async function refineScript(
  script: TikTokScript,
  feedback: string
): Promise<TikTokScript> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Refine this TikTok script based on the feedback:

Current Script:
Hook: ${script.sections.find((s) => s.type === 'hook')?.text}
Unlock: ${script.sections.find((s) => s.type === 'unlock')?.text}
CTA: ${script.sections.find((s) => s.type === 'cta')?.text}

Feedback: ${feedback}

Respond with a JSON object:
{
  "hookText": "refined hook",
  "unlockText": "refined unlock",
  "ctaText": "refined cta"
}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    return script;
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return script;
  }

  const refinedData = JSON.parse(jsonMatch[0]);

  const newSections: ScriptSection[] = [
    { type: 'hook', startTime: 0, endTime: 3, text: refinedData.hookText },
    { type: 'unlock', startTime: 3, endTime: 30, text: refinedData.unlockText },
    { type: 'cta', startTime: 30, endTime: 45, text: refinedData.ctaText },
  ];

  return {
    ...script,
    sections: newSections,
    fullText: newSections.map((s) => s.text).join(' '),
    updatedAt: new Date().toISOString(),
  };
}

export function getAlternativeHookType(currentHookType: HookType): HookType {
  const hookTypes: HookType[] = [
    'provocative_question',
    'surprising_fact',
    'counter_intuitive',
    'future_prediction',
    'personal_story',
  ];
  const currentIndex = hookTypes.indexOf(currentHookType);
  const nextIndex = (currentIndex + 1) % hookTypes.length;
  return hookTypes[nextIndex];
}

export function getAlternativeVisualStyle(currentStyle: VisualStyle): VisualStyle {
  const styles: VisualStyle[] = [
    'abstract_data_visualization',
    'solarpunk_technology',
    'holographic_interface',
    'human_ai_interaction',
    'research_lab_aesthetic',
  ];
  const currentIndex = styles.indexOf(currentStyle);
  const nextIndex = (currentIndex + 1) % styles.length;
  return styles[nextIndex];
}
