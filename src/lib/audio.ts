import { AudioAsset, TikTokScript } from '@/types';
import { generateId } from './utils';

// ElevenLabs Voice IDs - Recommended voices for professional, empathetic narration
export const VOICE_OPTIONS = {
  adam: {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description: 'Deep, warm male voice. Professional and trustworthy.',
  },
  rachel: {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    description: 'Clear, articulate female voice. Engaging and empathetic.',
  },
  josh: {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    description: 'Young, energetic male voice. Perfect for tech content.',
  },
  elli: {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    description: 'Young, clear female voice. Friendly and approachable.',
  },
  arnold: {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    description: 'Crisp, British-accented male voice. Authoritative.',
  },
  domi: {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    description: 'Strong, confident female voice. Inspirational tone.',
  },
};

// Recommended voice for ethical AI content - professional, empathetic, articulate
export const DEFAULT_VOICE = VOICE_OPTIONS.adam;

interface ElevenLabsGenerateResponse {
  audio_base64?: string;
}

export async function generateVoiceover(
  script: TikTokScript,
  voiceId: string = DEFAULT_VOICE.id
): Promise<AudioAsset> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }

  const voice = Object.values(VOICE_OPTIONS).find((v) => v.id === voiceId) || DEFAULT_VOICE;

  // Prepare the text with SSML-like pauses for natural delivery
  const textWithPauses = formatScriptForSpeech(script);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: textWithPauses,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  // Get the audio as a blob
  const audioBlob = await response.blob();
  const audioBuffer = await audioBlob.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString('base64');
  const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

  // Estimate duration based on word count (average 150 words per minute)
  const wordCount = script.fullText.split(/\s+/).length;
  const estimatedDuration = (wordCount / 150) * 60;

  return {
    id: generateId(),
    scriptId: script.id,
    voiceId,
    voiceName: voice.name,
    audioUrl,
    duration: estimatedDuration,
    createdAt: new Date().toISOString(),
  };
}

function formatScriptForSpeech(script: TikTokScript): string {
  const parts: string[] = [];

  for (const section of script.sections) {
    let text = section.text;

    // Add slight pause after hook for dramatic effect
    if (section.type === 'hook') {
      text = text + '...';
    }

    // Add pause before CTA
    if (section.type === 'cta') {
      text = '... ' + text;
    }

    parts.push(text);
  }

  return parts.join(' ');
}

export async function getVoicePreview(voiceId: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/voices/${voiceId}`,
      {
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.preview_url || null;
  } catch {
    return null;
  }
}

export async function listAvailableVoices(): Promise<typeof VOICE_OPTIONS> {
  // Return our curated list of recommended voices
  return VOICE_OPTIONS;
}

export function getRecommendedVoice(contentTone: 'professional' | 'casual' | 'inspirational'): typeof DEFAULT_VOICE {
  switch (contentTone) {
    case 'professional':
      return VOICE_OPTIONS.adam;
    case 'casual':
      return VOICE_OPTIONS.josh;
    case 'inspirational':
      return VOICE_OPTIONS.domi;
    default:
      return DEFAULT_VOICE;
  }
}
