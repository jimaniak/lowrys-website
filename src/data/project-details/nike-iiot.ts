import type { ProjectDetail } from './types';

export const nikeIiotDetail: ProjectDetail = {
  id: 'nike-iiot',
  tagline:
    'OT-to-IT manufacturing data pipeline for Nike Air extrusion — Kepware, ThingWorx, Azure, and terabyte-scale analytics.',
  overview:
    'Contract engagement via Mindlance (Jan–May 2026) as Manufacturing Data Engineer on Nike extrusion operations. Initial Power BI scope expanded when BI could not scale to 20+ machines streaming thousands of sensor points per second. Jim remediated year-long data integrity failures and designed infrastructure for predictive process setup.',
  architecture: [
    {
      title: 'OT → IT pipeline',
      items: [
        'Kepware — OT orchestration, tags, machine IP connectivity',
        'ThingWorx — IT integration layer',
        'AMU dashboard — manufacturing visibility',
        'Azure — cloud persistence and analytics path',
      ],
    },
    {
      title: 'Data integrity remediation',
      items: [
        'Resolved stalled year-long project — inconsistent naming',
        'Duplicate tags and schema mismatches across sensor families',
        'CDC, roller, thickness, and machine sensor normalization',
        'Cross-machine data alignment for reliable reporting',
      ],
    },
    {
      title: 'Analytics at scale',
      items: [
        'Terabyte-scale on-premises rolling buffer',
        'Second-level granularity with ~two-week retention window',
        'Python dashboard on same VM to avoid IT/OT latency',
        'Power BI semantic model strategy for executive and supervisor views',
      ],
    },
    {
      title: 'Forward roadmap',
      items: [
        'Predictive process setup — historical extrusion parameters',
        'Tolerance drift precursors for data-driven initial configs',
        'Ideal Azure Event Hubs + Data Factory architecture documented',
        'Stakeholder coordination across OT, IT, and plant floor',
      ],
    },
  ],
  shipped: [
    'Full pipeline architecture redesign beyond initial Power BI scope',
    'Data integrity remediation across 20+ extrusion machines',
    'Terabyte-scale rolling buffer design for high-frequency telemetry',
    'Python manufacturing dashboard on OT-adjacent infrastructure',
    'Power BI manufacturing dashboard strategy and dataflow documentation',
    'Stakeholder coordination during workforce reduction (~30% staffing cut)',
  ],
  distinctFrom:
    'Contract engagement (Mindlance → Nike Manufacturing) — not a personal SaaS product. Ameren enterprise background is separate; cite Nike for IIoT, Kepware, and manufacturing analytics roles.',
  repoNote: 'Source: Nike — Documentation/Power BI Manufacturing Dashboard/markdowns/ (START_HERE, ideal_dataflow_architecture).',
};
