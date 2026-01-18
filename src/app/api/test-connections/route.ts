import { NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

interface ConnectionResult {
  service: string;
  status: 'success' | 'error' | 'missing_key';
  message: string;
  data?: unknown;
  latency?: number;
}

async function testFirecrawl(): Promise<ConnectionResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey || apiKey === 'your_firecrawl_api_key_here') {
    return { service: 'Firecrawl', status: 'missing_key', message: 'API key not configured' };
  }

  const start = Date.now();
  try {
    const firecrawl = new FirecrawlApp({ apiKey });
    const result = await firecrawl.search('AI ethics research', { limit: 1 }) as unknown;
    const latency = Date.now() - start;

    // Check if we got results
    const payload = result as { data?: unknown[]; web?: unknown[] };
    const results = Array.isArray(payload?.web)
      ? payload.web
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(result)
          ? result
          : [];
    const count = results.length;

    return {
      service: 'Firecrawl',
      status: 'success',
      message: `Connected successfully. Found ${count} result(s)`,
      data: { resultCount: count, sampleResult: results?.[0] },
      latency,
    };
  } catch (error) {
    return {
      service: 'Firecrawl',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

async function testAnthropic(): Promise<ConnectionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return { service: 'Anthropic (Claude)', status: 'missing_key', message: 'API key not configured' };
  }

  const start = Date.now();
  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say "Connection successful" in exactly 2 words.' }],
    });

    const latency = Date.now() - start;
    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';

    return {
      service: 'Anthropic (Claude)',
      status: 'success',
      message: `Connected successfully`,
      data: { response: text, model: response.model },
      latency,
    };
  } catch (error) {
    return {
      service: 'Anthropic (Claude)',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

async function testReplicate(): Promise<ConnectionResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken || apiToken === 'your_replicate_api_token_here') {
    return { service: 'Replicate (FLUX)', status: 'missing_key', message: 'API token not configured' };
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions?limit=1', {
      headers: { Authorization: `Token ${apiToken}` },
    });
    const latency = Date.now() - start;

    if (!response.ok) {
      return {
        service: 'Replicate (FLUX)',
        status: 'error',
        message: `API returned ${response.status}: ${response.statusText}`,
        latency,
      };
    }

    const data = await response.json();
    const predictionCount = Array.isArray(data?.results) ? data.results.length : 0;
    return {
      service: 'Replicate (FLUX)',
      status: 'success',
      message: 'Connected successfully',
      data: { predictionCount },
      latency,
    };
  } catch (error) {
    return {
      service: 'Replicate (FLUX)',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

async function testElevenLabs(): Promise<ConnectionResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
    return { service: 'ElevenLabs', status: 'missing_key', message: 'API key not configured' };
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      return {
        service: 'ElevenLabs',
        status: 'error',
        message: `API returned ${response.status}: ${response.statusText}`,
        latency,
      };
    }

    const data = await response.json();
    const voiceCount = data.voices?.length || 0;

    return {
      service: 'ElevenLabs',
      status: 'success',
      message: `Connected successfully. ${voiceCount} voices available`,
      data: { voiceCount },
      latency,
    };
  } catch (error) {
    return {
      service: 'ElevenLabs',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

async function testSupabase(): Promise<ConnectionResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url === 'your_supabase_url_here' || !key || key === 'your_supabase_anon_key_here') {
    return { service: 'Supabase', status: 'missing_key', message: 'URL or API key not configured' };
  }

  const start = Date.now();
  try {
    const supabase = createClient(url, key);

    // Try to query the posts table to verify connection and schema
    const { data, error } = await supabase.from('posts').select('id').limit(1);
    const latency = Date.now() - start;

    if (error) {
      // Check if it's a "table doesn't exist" error
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return {
          service: 'Supabase',
          status: 'error',
          message: 'Connected but tables not created. Run the SQL schema.',
          latency,
        };
      }
      return {
        service: 'Supabase',
        status: 'error',
        message: error.message,
        latency,
      };
    }

    return {
      service: 'Supabase',
      status: 'success',
      message: `Connected successfully. Posts table exists.`,
      data: { postsCount: data?.length || 0 },
      latency,
    };
  } catch (error) {
    return {
      service: 'Supabase',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    };
  }
}

export async function GET() {
  const results: ConnectionResult[] = await Promise.all([
    testFirecrawl(),
    testAnthropic(),
    testReplicate(),
    testElevenLabs(),
    testSupabase(),
  ]);

  const allSuccess = results.every(r => r.status === 'success');
  const successCount = results.filter(r => r.status === 'success').length;

  return NextResponse.json({
    success: allSuccess,
    summary: `${successCount}/${results.length} services connected`,
    results,
    timestamp: new Date().toISOString(),
  });
}
