import FirecrawlApp from '@mendable/firecrawl-js';
import { ResearchSource, ResearchSummary } from '@/types';
import { generateId, isAcademicSource, calculateCredibilityScore, extractDomain } from './utils';

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

export async function searchResearch(topic: string): Promise<ResearchSource[]> {
  try {
    const searchResult = await firecrawl.search(topic, {
      limit: 10,
      scrapeOptions: { formats: ['markdown'] },
    }) as { success?: boolean; data?: FirecrawlSearchResult[] } | FirecrawlSearchResult[];

    // Handle both response formats
    const results = Array.isArray(searchResult)
      ? searchResult
      : (searchResult as { data?: FirecrawlSearchResult[] }).data;

    if (!results || results.length === 0) {
      console.error('Firecrawl search returned no results');
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
  } catch (error) {
    console.error('Error searching research:', error);
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
