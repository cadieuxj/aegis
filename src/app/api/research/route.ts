import { NextRequest, NextResponse } from 'next/server';
import { searchResearch, RESEARCH_TOPICS, filterAcademicSources } from '@/lib/research';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get('topic');
    const academicOnly = searchParams.get('academicOnly') === 'true';

    const searchTopic = topic || RESEARCH_TOPICS[Math.floor(Math.random() * RESEARCH_TOPICS.length)];

    let sources = await searchResearch(searchTopic);

    if (academicOnly) {
      sources = filterAcademicSources(sources);
    }

    return NextResponse.json({
      success: true,
      topic: searchTopic,
      sources,
      count: sources.length,
    });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch research' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topics } = body;

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

    return NextResponse.json({
      success: true,
      sources: sortedSources,
      count: sortedSources.length,
    });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch research' },
      { status: 500 }
    );
  }
}
