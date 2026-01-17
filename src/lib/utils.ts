import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

export function isAcademicSource(url: string): boolean {
  const academicDomains = [
    'arxiv.org',
    'nature.com',
    'science.org',
    'ieee.org',
    'acm.org',
    'springer.com',
    'sciencedirect.com',
    'pnas.org',
    'nih.gov',
    'pubmed.gov',
    '.edu',
    'researchgate.net',
    'semanticscholar.org',
  ];
  const domain = extractDomain(url).toLowerCase();
  return academicDomains.some((d) => domain.includes(d));
}

export function calculateCredibilityScore(url: string, content: string): number {
  let score = 50;

  if (isAcademicSource(url)) score += 30;
  if (content.toLowerCase().includes('peer-reviewed')) score += 10;
  if (content.toLowerCase().includes('et al.')) score += 5;
  if (/\[\d+\]/.test(content)) score += 5;

  return Math.min(100, score);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
