import type { ProjectDetail } from './types';
import { workaideJobsDetail } from './workaide-jobs';
import { ezVoiceDetail } from './ez-voice';
import { ezwebDetail } from './ezweb';
import { autoshopsDetail } from './autoshops';

const projectDetails: Record<string, ProjectDetail> = {
  'workaide-jobs': workaideJobsDetail,
  'ez-voice': ezVoiceDetail,
  'ezweb': ezwebDetail,
  'autoshops': autoshopsDetail,
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
