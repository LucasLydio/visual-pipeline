import {
  DashboardSnapshot,
  DeploymentRecord,
  MockScenario,
  MockScenarioOption,
  PipelineStage,
  QueuedProject,
  TeamMember,
} from '../models/pipeline.models';

export const MOCK_SCENARIOS: readonly MockScenarioOption[] = [
  { id: 'healthy', label: 'Team flow', description: 'Projects moving normally' },
  { id: 'degraded', label: 'Busy queue', description: 'A warning and longer waits' },
  { id: 'incident', label: 'Blocked deploy', description: 'A failed production step' },
  { id: 'empty', label: 'New team', description: 'No connected projects yet' },
  { id: 'offline', label: 'API offline', description: 'Network error state' },
];

const maya: TeamMember = {
  id: 'member-maya',
  name: 'Maya Chen',
  initials: 'MC',
  role: 'Tech lead',
};
const andre: TeamMember = {
  id: 'member-andre',
  name: 'Andre Costa',
  initials: 'AC',
  role: 'Backend developer',
};
const priya: TeamMember = {
  id: 'member-priya',
  name: 'Priya Shah',
  initials: 'PS',
  role: 'Frontend developer',
};
const jon: TeamMember = {
  id: 'member-jon',
  name: 'Jon Bell',
  initials: 'JB',
  role: 'DevOps engineer',
};
const sofia: TeamMember = {
  id: 'member-sofia',
  name: 'Sofia Reyes',
  initials: 'SR',
  role: 'QA engineer',
};

const checkoutSteps: readonly PipelineStage[] = [
  { name: 'Validate', detail: '32s', status: 'success' },
  { name: 'Tests', detail: '1m 18s', status: 'success' },
  { name: 'Build', detail: '2m 46s', status: 'success' },
  { name: 'Security', detail: 'Running', status: 'running' },
  { name: 'Deploy', detail: 'Waiting', status: 'queued' },
];

const webSteps: readonly PipelineStage[] = [
  { name: 'Validate', detail: '28s', status: 'success' },
  { name: 'Tests', detail: 'Passed', status: 'success' },
  { name: 'Build', detail: 'Queued', status: 'queued' },
  { name: 'Preview', detail: 'Waiting', status: 'queued' },
  { name: 'Deploy', detail: 'Waiting', status: 'queued' },
];

const workerSteps: readonly PipelineStage[] = [
  { name: 'Validate', detail: 'Passed', status: 'success' },
  { name: 'Tests', detail: '2 warnings', status: 'warning' },
  { name: 'Build', detail: 'Waiting', status: 'queued' },
  { name: 'Security', detail: 'Waiting', status: 'queued' },
  { name: 'Deploy', detail: 'Waiting', status: 'queued' },
];

const projects: readonly QueuedProject[] = [
  {
    id: 'project-checkout',
    name: 'Checkout service',
    repository: 'acme/checkout-service',
    provider: 'GitHub',
    branch: 'main',
    environment: 'Production',
    status: 'running',
    queuePosition: null,
    queuedAt: 'Started 4 min ago',
    estimate: '~3 min left',
    responsible: maya,
    members: [maya, andre, jon, sofia],
    steps: checkoutSteps,
  },
  {
    id: 'project-web',
    name: 'Team console',
    repository: 'acme/visual-console',
    provider: 'GitLab',
    branch: 'feat/project-queue',
    environment: 'Preview',
    status: 'queued',
    queuePosition: 1,
    queuedAt: 'Queued 2 min ago',
    estimate: '~8 min',
    responsible: priya,
    members: [priya, maya, sofia],
    steps: webSteps,
  },
  {
    id: 'project-worker',
    name: 'Billing worker',
    repository: 'acme/billing-worker',
    provider: 'Bitbucket',
    branch: 'fix/retry-window',
    environment: 'Staging',
    status: 'warning',
    queuePosition: 2,
    queuedAt: 'Queued 7 min ago',
    estimate: '~14 min',
    responsible: andre,
    members: [andre, jon, sofia],
    steps: workerSteps,
  },
];

const deployments: readonly DeploymentRecord[] = [
  {
    id: 'deploy-2048',
    project: 'Checkout service',
    environment: 'Production',
    version: 'v2.18.4',
    branch: 'main',
    deployedAt: 'Today, 10:42',
    responsible: 'Maya Chen',
    status: 'success',
  },
  {
    id: 'deploy-2047',
    project: 'Identity API',
    environment: 'Production',
    version: 'v4.9.1',
    branch: 'main',
    deployedAt: 'Today, 09:18',
    responsible: 'Andre Costa',
    status: 'success',
  },
  {
    id: 'deploy-2046',
    project: 'Team console',
    environment: 'Preview',
    version: 'pr-184',
    branch: 'feat/member-modal',
    deployedAt: 'Yesterday, 17:06',
    responsible: 'Priya Shah',
    status: 'warning',
  },
  {
    id: 'deploy-2045',
    project: 'Billing worker',
    environment: 'Staging',
    version: 'v1.32.0',
    branch: 'main',
    deployedAt: 'Yesterday, 15:51',
    responsible: 'Jon Bell',
    status: 'failed',
  },
];

const healthy: DashboardSnapshot = {
  workspaceName: 'Acme delivery queue',
  workspaceStatus: 'success',
  summary: 'One project is running and two are ready for the team.',
  updatedLabel: 'Updated 2 minutes ago',
  projects,
  deployments,
};

const degraded: DashboardSnapshot = {
  ...healthy,
  workspaceStatus: 'warning',
  summary: 'The queue is moving slowly while one project needs attention.',
  updatedLabel: 'Updated just now',
  projects: projects.map((project, index) =>
    index === 0
      ? {
          ...project,
          status: 'warning' as const,
          estimate: '~12 min left',
          steps: project.steps.map((step) =>
            step.name === 'Security'
              ? { ...step, detail: '2 warnings', status: 'warning' as const }
              : step,
          ),
        }
      : { ...project, queuePosition: index + 2, estimate: `~${18 + index * 6} min` },
  ),
};

const incident: DashboardSnapshot = {
  ...healthy,
  workspaceStatus: 'failed',
  summary: 'Production is blocked. The responsible team has been notified.',
  updatedLabel: 'Updated just now',
  projects: [
    {
      ...projects[0],
      name: 'Payment gateway',
      repository: 'acme/payment-gateway',
      branch: 'hotfix/provider-timeout',
      status: 'failed',
      estimate: 'Blocked',
      steps: [
        { name: 'Validate', detail: 'Passed', status: 'success' },
        { name: 'Tests', detail: 'Passed', status: 'success' },
        { name: 'Build', detail: 'Passed', status: 'success' },
        { name: 'Security', detail: 'Failed', status: 'failed' },
        { name: 'Deploy', detail: 'Blocked', status: 'queued' },
      ],
    },
    ...projects.slice(1),
  ],
};

const empty: DashboardSnapshot = {
  workspaceName: 'Your delivery queue',
  workspaceStatus: 'queued',
  summary: 'Connect a repository to queue the first project.',
  updatedLabel: 'No activity yet',
  projects: [],
  deployments: [],
};

export const MOCK_DASHBOARDS: Readonly<
  Record<Exclude<MockScenario, 'offline'>, DashboardSnapshot>
> = { healthy, degraded, incident, empty };
