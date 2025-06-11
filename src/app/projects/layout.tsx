import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics & BI Projects | Power BI, Data Engineering, Consulting | Jim Lowry',
  description: 'Explore analytics, Power BI, business intelligence, and data engineering projects by Jim Lowry. See how robust analytics, automation, and consulting deliver measurable business value and support organizational decision-making.',
  keywords: 'analytics projects, business intelligence, BI, Power BI, Power Query, Power Platform, data engineering, analytics consulting, automation, SQL, Tableau, Google Data Studio, analytics solutions, analytics implementation, analytics for business, analytics for organizations, analytics for consulting, analytics for decision making, analytics for risk management, analytics for public sector, analytics for enterprise, analytics for government, analytics for non-profits, Jim Lowry',
  alternates: {
    canonical: 'https://www.lowrys.org/projects'
  },
  openGraph: {
    title: 'Analytics & BI Projects | Power BI, Data Engineering, Consulting | Jim Lowry',
    description: 'Analytics, Power BI, and data engineering projects by Jim Lowry. Robust analytics and consulting for measurable business value.',
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
