import type { ProjectDetail } from './types';

export const airtisanDetail: ProjectDetail = {
  id: 'airtisan',
  tagline:
    'Blockchain art authentication platform for collectors — conversion-focused UX with Firebase backend.',
  overview:
    'AIrtisan.net helps high-value art collectors verify authenticity and provenance. A React SPA with Firebase backend targets affluent collector SEO — structured data, accessibility compliance, and mobile-responsive layouts optimized for trust and conversion.',
  architecture: [
    {
      title: 'Frontend',
      items: [
        'React with TypeScript',
        'Component-driven architecture with context-based state',
        'Mobile-responsive layouts',
        'Accessibility-compliant UI patterns',
      ],
    },
    {
      title: 'Backend & auth',
      items: [
        'Firebase Authentication and Firestore',
        'API services layer for certification workflows',
        'GitHub Pages / custom domain (CNAME) deployment path',
      ],
    },
    {
      title: 'Product & SEO',
      items: [
        'Collector-focused landing and benefit pages',
        'Structured data for search visibility',
        'AI computer vision integration concepts for artwork verification',
        'Conversion-optimized flows for authentication requests',
      ],
    },
  ],
  shipped: [
    'Live public site at airtisan.net',
    'React frontend with Firebase integration',
    'Mobile-responsive collector-focused UX',
    'SEO strategy and structured data implementation',
    'Blockchain certification platform architecture (target state documented)',
  ],
  distinctFrom:
    'Secondary solo platform — weaker fit for current AI/SaaS positioning than WorkAide Jobs or EZ Voice, but demonstrates earlier full-stack product ownership.',
  repoNote: 'Source: AIrtisian/airtisan — docs/AIrtisan Complete Project Structure - Target State.md.',
};
