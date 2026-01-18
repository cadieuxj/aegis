import FirecrawlApp from '@mendable/firecrawl-js';
import { ResearchSource, ResearchSummary } from '@/types';
import { generateId, isAcademicSource, calculateCredibilityScore, extractDomain } from './utils';
import { supabaseAdmin } from './supabase';
import { logActivity } from './activity';

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

// Research topics focused on ethical AI and humanitarian tech
export const RESEARCH_TOPICS = [
  'peer-reviewed AI for good research 2024 2025',
  'humanitarian robotics breakthroughs academic',
  'ethical AI framework research university',
  'AI healthcare developing countries peer-reviewed',
  'machine learning climate change solutions research',
  'AI accessibility technology disabled peer-reviewed',
  'artificial intelligence disaster response humanitarian',
  'ethical machine learning bias mitigation research',
  'AI education equity research academic',
  'sustainable AI computing research environmental',
];

// Domains to prioritize for credibility
const PRIORITY_DOMAINS = [
  'arxiv.org',
  'nature.com',
  'science.org',
  'ieee.org',
  'acm.org',
  'mit.edu',
  'stanford.edu',
  'berkeley.edu',
  'harvard.edu',
  'cam.ac.uk',
  'ox.ac.uk',
];

interface FirecrawlSearchResult {
  url: string;
  title: string;
  markdown?: string;
  description?: string;
}

interface FirecrawlDocumentLike {
  markdown?: string;
  summary?: string;
  metadata?: {
    url?: string;
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
}

type FirecrawlSearchPayload =
  | { data?: unknown[] }
  | { web?: unknown[]; news?: unknown[]; images?: unknown[] }
  | unknown[];

function normalizeSearchResults(payload: FirecrawlSearchPayload): FirecrawlSearchResult[] {
  if (!payload) {
    return [];
  }

  const toResult = (item: unknown): FirecrawlSearchResult | null => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const raw = item as Partial<FirecrawlSearchResult> & FirecrawlDocumentLike & {
      url?: string;
      title?: string;
      description?: string;
    };
    const metadata = raw.metadata ?? {};
    const url = raw.url ?? metadata.url;
    if (!url) {
      return null;
    }

    const title = raw.title ?? metadata.title ?? metadata.ogTitle ?? url;
    const description = raw.description ?? metadata.description ?? metadata.ogDescription ?? raw.summary;
    const markdown = raw.markdown;

    return {
      url,
      title,
      description,
      markdown,
    };
  };

  const collectFromArray = (items: unknown[] | undefined): FirecrawlSearchResult[] => {
    if (!items?.length) {
      return [];
    }
    return items
      .map(toResult)
      .filter((value): value is FirecrawlSearchResult => Boolean(value));
  };

  if (Array.isArray(payload)) {
    return collectFromArray(payload);
  }

  const typedPayload = payload as { data?: unknown[]; web?: unknown[]; news?: unknown[]; images?: unknown[] };

  if (typedPayload.data) {
    return collectFromArray(typedPayload.data);
  }

  return [
    ...collectFromArray(typedPayload.web),
    ...collectFromArray(typedPayload.news),
    ...collectFromArray(typedPayload.images),
  ];
}

export async function searchResearch(topic: string): Promise<ResearchSource[]> {
  try {
    const searchResult = await firecrawl.search(topic, {
      limit: 5, // Reduced to conserve API credits
      categories: ['research'],
      timeout: 30000,
    }) as FirecrawlSearchPayload;

    const results = normalizeSearchResults(searchResult);

    if (!results || results.length === 0) {
      console.log('[Research] Firecrawl search returned no results for:', topic);
      return [];
    }

    const sources: ResearchSource[] = results
      .filter((result: FirecrawlSearchResult) => result.url && result.title)
      .map((result: FirecrawlSearchResult) => {
        const markdown = result.markdown || result.description || '';
        return {
          id: generateId(),
          url: result.url,
          title: result.title,
          domain: extractDomain(result.url),
          markdown,
          credibilityScore: calculateCredibilityScore(result.url, markdown),
          fetchedAt: new Date().toISOString(),
        };
      });

    // Sort by credibility score and prioritize academic sources
    return sources.sort((a, b) => {
      const aIsAcademic = isAcademicSource(a.url) ? 20 : 0;
      const bIsAcademic = isAcademicSource(b.url) ? 20 : 0;
      return (b.credibilityScore + bIsAcademic) - (a.credibilityScore + aIsAcademic);
    });
  } catch (error: unknown) {
    // Check for insufficient credits error
    const err = error as { status?: number; code?: string; message?: string };
    if (err.status === 402 || err.code === 'ERR_BAD_REQUEST') {
      console.error('[Research] Firecrawl credits exhausted:', err.message);
      throw new Error('Firecrawl API credits exhausted. Please upgrade your plan or wait for credits to reset.');
    }
    console.error('[Research] Error searching:', error);
    throw new Error('Failed to search for research');
  }
}

export async function fetchMultipleTopics(topics: string[]): Promise<ResearchSource[]> {
  const allSources: ResearchSource[] = [];
  const seenUrls = new Set<string>();

  for (const topic of topics) {
    const sources = await searchResearch(topic);
    for (const source of sources) {
      if (!seenUrls.has(source.url)) {
        seenUrls.add(source.url);
        allSources.push(source);
      }
    }
  }

  // Return top sources by credibility
  return allSources
    .sort((a, b) => b.credibilityScore - a.credibilityScore)
    .slice(0, 20);
}

export async function scrapeUrl(url: string): Promise<string | null> {
  try {
    const result = await firecrawl.scrape(url, {
      formats: ['markdown'],
    }) as { success?: boolean; markdown?: string };

    if (result.markdown) {
      return result.markdown;
    }
    return null;
  } catch (error) {
    console.error('Error scraping URL:', error);
    return null;
  }
}

export function filterAcademicSources(sources: ResearchSource[]): ResearchSource[] {
  return sources.filter(
    (source) => isAcademicSource(source.url) || source.credibilityScore >= 70
  );
}

export function getRandomTopic(): string {
  return RESEARCH_TOPICS[Math.floor(Math.random() * RESEARCH_TOPICS.length)];
}

export function createResearchSummary(
  sources: ResearchSource[],
  topic: string,
  keyFindings: string[],
  ethicalImplications: string[],
  potentialHooks: string[]
): ResearchSummary {
  return {
    id: generateId(),
    sources,
    topic,
    keyFindings,
    ethicalImplications,
    potentialHooks,
    createdAt: new Date().toISOString(),
  };
}

export async function persistResearchSummary(
  topic: string,
  sources: ResearchSource[]
): Promise<string | null> {
  if (!sources.length) {
    return null;
  }

  const uniqueSources = Array.from(
    new Map(sources.map((source) => [source.url, source])).values()
  );
  const urls = uniqueSources.map((source) => source.url);

  const { data: existingSources, error: existingError } = await supabaseAdmin
    .from('research_sources')
    .select('id, url')
    .in('url', urls);

  if (existingError) {
    throw new Error(`Failed to check research sources: ${existingError.message}`);
  }

  const existingByUrl = new Map(
    (existingSources || []).map((row: { id: string; url: string }) => [row.url, row.id])
  );

  const newSources = uniqueSources.filter((source) => !existingByUrl.has(source.url));

  if (newSources.length > 0) {
    const insertPayload = newSources.map((source) => ({
      id: source.id,
      url: source.url,
      title: source.title,
      domain: source.domain,
      markdown: source.markdown || null,
      credibility_score: source.credibilityScore,
      fetched_at: source.fetchedAt,
    }));

    const { error: insertError } = await supabaseAdmin
      .from('research_sources')
      .insert(insertPayload);

    if (insertError) {
      throw new Error(`Failed to insert research sources: ${insertError.message}`);
    }
  }

  const sourceIds = uniqueSources.map(
    (source) => existingByUrl.get(source.url) || source.id
  );

  const summaryId = generateId();

  const { error: summaryError } = await supabaseAdmin
    .from('research_summaries')
    .insert({
      id: summaryId,
      topic,
      key_findings: [],
      ethical_implications: [],
      potential_hooks: [],
    });

  if (summaryError) {
    throw new Error(`Failed to insert research summary: ${summaryError.message}`);
  }

  const linkPayload = sourceIds.map((sourceId) => ({
    summary_id: summaryId,
    source_id: sourceId,
  }));

  if (linkPayload.length > 0) {
    const { error: linkError } = await supabaseAdmin
      .from('summary_sources')
      .insert(linkPayload);

    if (linkError) {
      throw new Error(`Failed to link research sources: ${linkError.message}`);
    }
  }

  await logActivity({
    eventType: 'research.persisted',
    entityType: 'research_summary',
    entityId: summaryId,
    metadata: {
      topic,
      sources: sourceIds.length,
    },
  });

  return summaryId;
}
