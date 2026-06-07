import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Production Portfolio | SaaS, Lead Dev & Enterprise | Jim Lowry',
  description:
    'Live SaaS products, lead developer engagements, and enterprise work by Jim Lowry — WorkAide Jobs, EZ Voice, EZWeb.work, Autoshops, and more.',
  keywords:
    'Jim Lowry portfolio, AI product engineer, WorkAide Jobs, EZ Voice, EZWeb, Autoshops, full-stack SaaS, Next.js, Supabase, production software',
  alternates: {
    canonical: 'https://www.lowrys.org/projects',
  },
  openGraph: {
    title: 'Production Portfolio | Jim Lowry',
    description:
      'Live SaaS products and production engineering work — from solo founder velocity to enterprise data platforms.',
    url: 'https://www.lowrys.org/projects',
    type: 'website',
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
