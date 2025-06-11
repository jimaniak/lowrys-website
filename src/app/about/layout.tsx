import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Jim Lowry | Data Analytics, BI Consulting, Power BI, Data Engineering',
  description: 'Learn about Jim Lowry, a data analytics and business intelligence consultant specializing in Power BI, Power Query, Microsoft Power Platform, and data engineering. Focused on delivering actionable insights, automation, and measurable business value for organizations and consulting clients. Committed to continuous learning and analytics best practices.',
  keywords: 'about Jim Lowry, data analytics, business intelligence, BI, Power BI, Power Query, Power Platform, data engineering, analytics consulting, automation, SQL, Tableau, Google Data Studio, analytics career, analytics skills, analytics consultant, analytics expert, analytics professional, analytics for business, analytics for organizations, analytics for consulting, analytics for decision making, analytics for risk management, analytics for public sector, analytics for enterprise, analytics for government, analytics for non-profits',
  alternates: {
    canonical: 'https://www.lowrys.org/about'
  },
  openGraph: {
    title: 'About Jim Lowry | Data Analytics, BI Consulting, Power BI, Data Engineering',
    description: 'About Jim Lowry, a data analytics and business intelligence consultant focused on Power BI, automation, and delivering measurable value for organizations.',
    url: 'https://www.lowrys.org/about',
    type: 'profile',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
