export const MEMBER_TITLE_OPTIONS = [
  'Tech Lead',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'DevOps Engineer',
  'QA Engineer',
  'Product Manager',
  'Engineering Manager',
  'UX/UI Designer',
  'Data Engineer',
  'Security Engineer',
  'Mobile Engineer',
  'Platform Engineer',
  'Site Reliability Engineer',
  'Software Architect',
] as const;

export type MemberTitleOption = (typeof MEMBER_TITLE_OPTIONS)[number];
