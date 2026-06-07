import type { ProjectDetail } from './types';

export const ctHomeDetail: ProjectDetail = {
  id: 'ct-home',
  tagline:
    'EZ Web LLC client delivery — marketing site for a Hampton Roads home remodeling company.',
  overview:
    'CT Home Remodel (cthomeremodel.com) is a production marketing site built for a Virginia Beach / Hampton Roads remodeling client under EZ Web LLC. It is client delivery work — not an owned SaaS product — listed on the EZ Web portfolio and referenced lightly on lowrys.org for agency-capability proof.',
  architecture: [
    {
      title: 'Site stack',
      items: [
        'Next.js 14 with TypeScript',
        'Tailwind CSS for mobile-first responsive layout',
        'Vercel hosting with automatic deploy on push',
      ],
    },
    {
      title: 'Content & conversion',
      items: [
        'Service showcase pages for remodeling offerings',
        'About section and local Hampton Roads positioning',
        'Contact form with Resend email delivery',
        'Instagram feed integration for social proof',
      ],
    },
    {
      title: 'Agency context',
      items: [
        'Delivered under EZ Web LLC client services',
        'Referenced on ezweb.work portfolio',
        'Separate from owned flagship products (EZ Voice, EZWeb.work platform)',
      ],
    },
  ],
  shipped: [
    'Live production site at cthomeremodel.com',
    'Mobile-responsive marketing pages',
    'Contact form with email notifications via Resend',
    'Service and about content tailored to local remodel market',
    'Vercel production deployment pipeline',
  ],
  distinctFrom:
    'Client deliverable under EZ Web LLC — cite for agency/SMB web roles, not as a second owned SaaS product alongside WorkAide Jobs or EZ Voice.',
  repoNote: 'Source: CTHomeRemodel — README.md. Agency services at ezweb.work.',
};
