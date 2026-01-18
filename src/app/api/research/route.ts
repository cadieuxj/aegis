import { NextRequest, NextResponse } from 'next/server';
import {
  searchResearch,
  RESEARCH_TOPICS,
  filterAcademicSources,
  persistResearchSummary,
} from '@/lib/research';
import { logActivity } from '@/lib/activity';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const topic = searchParams.get('topic');
  const academicOnly = searchParams.get('academicOnly') === 'true';

  // Check if Firecrawl API key is configured
  if (!process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY === 'your_firecrawl_api_key_here') {
    return NextResponse.json({
      success: false,
      error: 'Firecrawl API key not configured. Add FIRECRAWL_API_KEY to .env.local',
      topic: null,
      sources: [],
      count: 0,
    });
  }

  try {
    const searchTopic = topic || RESEARCH_TOPICS[Math.floor(Math.random() * RESEARCH_TOPICS.length)];

    console.log(`[Research API] Searching for: "${searchTopic}"`);

    let sources = await searchResearch(searchTopic);

    console.log(`[Research API] Found ${sources.length} sources before filtering`);

    if (academicOnly && sources.length > 0) {
      sources = filterAcademicSources(sources);
      console.log(`[Research API] ${sources.length} sources after academic filter`);
    }

    if (sources.length > 0) {
      try {
        await persistResearchSummary(searchTopic, sources);
      } catch (logError) {
        console.error('[Research API] Failed to log research sources:', logError);
      }
    }

    await logActivity({
      eventType: 'research.search',
      entityType: 'research_summary',
      metadata: {
        topic: searchTopic,
        count: sources.length,
        academicOnly,
      },
    });

    return NextResponse.json({
      success: true,
      topic: searchTopic,
      sources,
      count: sources.length,
    });
  } catch (error) {
    console.error('[Research API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch research';
    await logActivity({
      eventType: 'research.search',
      status: 'error',
      message: errorMessage,
      metadata: {
        topic,
        academicOnly,
      },
    });

    return NextResponse.json(
      { success: false, error: errorMessage, topic: null, sources: [], count: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check if Firecrawl API key is configured
  if (!process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY === 'your_firecrawl_api_key_here') {
    return NextResponse.json({
      success: false,
      error: 'Firecrawl API key not configured',
      sources: [],
      count: 0,
    });
  }

  let topicCount = 0;

  try {
    const body = await request.json();
    const { topics } = body;
    topicCount = Array.isArray(topics) ? topics.length : 0;

    if (!topics || !Array.isArray(topics)) {
      return NextResponse.json(
        { success: false, error: 'Topics array required' },
        { status: 400 }
      );
    }

    const allSources = [];
    const seenUrls = new Set<string>();

    for (const topic of topics.slice(0, 5)) {
      const sources = await searchResearch(topic);
      for (const source of sources) {
        if (!seenUrls.has(source.url)) {
          seenUrls.add(source.url);
          allSources.push(source);
        }
      }
    }

    const sortedSources = allSources
      .sort((a, b) => b.credibilityScore - a.credibilityScore)
      .slice(0, 20);

    if (sortedSources.length > 0) {
      try {
        await persistResearchSummary('multiple topics', sortedSources);
      } catch (logError) {
        console.error('[Research API] Failed to log research sources:', logError);
      }
    }

    await logActivity({
      eventType: 'research.search_batch',
      entityType: 'research_summary',
      metadata: {
        topicCount: topics.length,
        count: sortedSources.length,
      },
    });

    return NextResponse.json({
      success: true,
      sources: sortedSources,
      count: sortedSources.length,
    });
  } catch (error) {
    console.error('[Research API] POST Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch research';
    await logActivity({
      eventType: 'research.search_batch',
      status: 'error',
      message: errorMessage,
      metadata: {
        topicCount,
      },
    });

    return NextResponse.json(
      { success: false, error: errorMessage, sources: [], count: 0 },
      { status: 500 }
    );
  }
}
