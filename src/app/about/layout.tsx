import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Data Analytics & Power Platform | Jim Lowry, B.S.',
  description: 'Learn about Jim Lowry, a specialist in data analytics, Microsoft Power BI, Power Query/M, Power Platform, and business intelligence. Committed to continuous learning and honest skills assessment.',
  keywords: 'about Jim Lowry, data analytics, Power BI, Power Query, Power Platform, business intelligence, continuous learning, analytics career, SQL, Tableau, Google Data Studio',
  alternates: {
    canonical: 'https://www.lowrys.org/about'
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
