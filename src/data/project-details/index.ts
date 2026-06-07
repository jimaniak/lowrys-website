import type { ProjectDetail } from './types';
import { workaideJobsDetail } from './workaide-jobs';
import { ezVoiceDetail } from './ez-voice';
import { ezwebDetail } from './ezweb';
import { autoshopsDetail } from './autoshops';
import { seoLowrysDetail } from './seo-lowrys';
import { pmWorkaideDetail } from './pm-workaide';
import { airtisanDetail } from './airtisan';
import { lowrysAnalyticsDetail } from './lowrys-analytics';
import { ctHomeDetail } from './ct-home';

const projectDetails: Record<string, ProjectDetail> = {
  'workaide-jobs': workaideJobsDetail,
  'ez-voice': ezVoiceDetail,
  'ezweb': ezwebDetail,
  'autoshops': autoshopsDetail,
  'seo-lowrys': seoLowrysDetail,
  'pm-workaide': pmWorkaideDetail,
  'airtisan': airtisanDetail,
  'lowrys-analytics': lowrysAnalyticsDetail,
  'ct-home': ctHomeDetail,
};

export function getProjectDetail(id: string): ProjectDetail | undefined {
  return projectDetails[id];
}

export function hasProjectDetail(id: string): boolean {
  return id in projectDetails;
}

export function getProjectDetailIds(): string[] {
  return Object.keys(projectDetails);
}

export type { ProjectDetail, ProjectDetailSection } from './types';
