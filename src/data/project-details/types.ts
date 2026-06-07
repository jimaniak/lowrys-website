export interface ProjectDetailSection {
  title: string;
  items: string[];
}

export interface ProjectDetail {
  id: string;
  tagline: string;
  overview: string;
  velocity?: string;
  architecture: ProjectDetailSection[];
  shipped: string[];
  distinctFrom?: string;
  repoNote?: string;
}
