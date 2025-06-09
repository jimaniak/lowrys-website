import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Experienced Business Process Consultant | Jim Lowry, B.S.',
  description: 'Versatile consultant with cross-domain expertise in financial analysis, process automation, and technical implementation. Solving complex business challenges with practical solutions.',
  keywords: 'business process consultant, cross-domain expertise, technical implementation specialist, business solutions expert, process optimization consultant, business efficiency improvements',
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
