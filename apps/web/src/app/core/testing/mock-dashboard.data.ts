import {
  DashboardSnapshot,
  MockScenario,
  MockScenarioOption,
  PipelineRun,
  PipelineStage,
} from '../models/pipeline.models';

export const MOCK_SCENARIOS: readonly MockScenarioOption[] = [
  { id: 'healthy', label: 'Healthy', description: 'Normal delivery flow' },
  { id: 'degraded', label: 'Degraded', description: 'Warnings and slower checks' },
  { id: 'incident', label: 'Incident', description: 'Failed production pipeline' },
  { id: 'empty', label: 'Empty', description: 'New workspace without runs' },
  { id: 'offline', label: 'API offline', description: 'Network error state' },
];

const healthyStages: readonly PipelineStage[] = [
  { name: 'Validate', detail: '32s', status: 'success' },
  { name: 'Unit checks', detail: '1m 18s', status: 'success' },
  { name: 'Build', detail: '2m 46s', status: 'success' },
  { name: 'Security scan', detail: '1 warning', status: 'warning' },
  { name: 'Staging', detail: 'Running', status: 'running' },
  { name: 'Production', detail: 'Waiting', status: 'queued' },
];

const healthyRuns: readonly PipelineRun[] = [
  {
    id: '#8421',
    service: 'checkout-service',
    branch: 'main',
    author: 'Maya Chen',
    duration: '6m 12s',
    started: '4 min ago',
    status: 'running',
  },
  {
    id: '#8420',
    service: 'identity-api',
    branch: 'main',
    author: 'Andre Costa',
    duration: '7m 04s',
    started: '22 min ago',
    status: 'success',
  },
  {
    id: '#8419',
    service: 'web-console',
    branch: 'feature/usage-view',
    author: 'Priya Shah',
    duration: '5m 48s',
    started: '41 min ago',
    status: 'warning',
  },
  {
    id: '#8418',
    service: 'billing-worker',
    branch: 'main',
    author: 'Jon Bell',
    duration: '3m 21s',
    started: '1 hr ago',
    status: 'failed',
  },
];

const healthy: DashboardSnapshot = {
  environmentLabel: 'Production healthy',
  environmentStatus: 'success',
  branch: 'main',
  updatedLabel: 'Updated 2 minutes ago',
  metrics: [
    { label: 'Success rate', value: '96.4%', detail: '+2.1% this month', trend: 'positive' },
    { label: 'Lead time', value: '8m 24s', detail: '41s faster', trend: 'positive' },
    { label: 'Deploy frequency', value: '18/day', detail: 'Across 6 services', trend: 'neutral' },
    { label: 'Active agents', value: '3 / 3', detail: 'All systems healthy', trend: 'positive' },
  ],
  activePipeline: {
    id: '#8421',
    service: 'checkout-service',
    commitMessage: 'feat: validate cart totals before authorization',
    duration: '6m 12s',
    status: 'running',
    author: 'Maya Chen',
    authorInitials: 'MC',
    commit: 'e41b7a2',
    branch: 'main',
    stages: healthyStages,
  },
  runs: healthyRuns,
  readiness: {
    environment: 'Production',
    score: 92,
    requiredChecks: '12 / 12',
    openWarnings: '1 review',
    changeRisk: 'Low',
  },
  deploymentQueue: [
    {
      service: 'checkout-service',
      environment: 'Production',
      state: 'Awaiting scan',
      estimate: '~8m',
    },
    {
      service: 'web-console',
      environment: 'Staging',
      state: 'Approved',
      estimate: '~14m',
    },
  ],
  agentRegions: [
    { region: 'us-east-1', utilization: 42 },
    { region: 'eu-west-1', utilization: 28 },
    { region: 'sa-east-1', utilization: 61 },
  ],
};

const degraded: DashboardSnapshot = {
  ...healthy,
  environmentLabel: 'Production degraded',
  environmentStatus: 'warning',
  updatedLabel: 'Updated 1 minute ago',
  metrics: [
    { label: 'Success rate', value: '82.7%', detail: '-8.4% this week', trend: 'negative' },
    { label: 'Lead time', value: '17m 09s', detail: '6m slower', trend: 'negative' },
    { label: 'Deploy frequency', value: '9/day', detail: 'Across 6 services', trend: 'neutral' },
    { label: 'Active agents', value: '2 / 3', detail: 'One agent constrained', trend: 'negative' },
  ],
  activePipeline: {
    ...healthy.activePipeline!,
    id: '#8427',
    duration: '14m 33s',
    stages: [
      { name: 'Validate', detail: '44s', status: 'success' },
      { name: 'Unit checks', detail: '2m 52s', status: 'success' },
      { name: 'Build', detail: '7m 10s', status: 'warning' },
      { name: 'Security scan', detail: '3 warnings', status: 'warning' },
      { name: 'Staging', detail: 'Running', status: 'running' },
      { name: 'Production', detail: 'Waiting', status: 'queued' },
    ],
  },
  readiness: { ...healthy.readiness, score: 68, openWarnings: '3 reviews', changeRisk: 'Medium' },
  agentRegions: [
    { region: 'us-east-1', utilization: 78 },
    { region: 'eu-west-1', utilization: 91 },
    { region: 'sa-east-1', utilization: 67 },
  ],
};

const incident: DashboardSnapshot = {
  ...healthy,
  environmentLabel: 'Production incident',
  environmentStatus: 'failed',
  branch: 'hotfix/payment-timeout',
  updatedLabel: 'Updated just now',
  metrics: [
    { label: 'Success rate', value: '61.2%', detail: '-24.8% today', trend: 'negative' },
    { label: 'Lead time', value: '31m 40s', detail: 'Critical regression', trend: 'negative' },
    {
      label: 'Deploy frequency',
      value: '3/day',
      detail: 'Release freeze active',
      trend: 'negative',
    },
    { label: 'Active agents', value: '2 / 3', detail: 'One agent offline', trend: 'negative' },
  ],
  activePipeline: {
    ...healthy.activePipeline!,
    id: '#8432',
    service: 'billing-worker',
    commitMessage: 'hotfix: retry payment provider timeouts',
    duration: '4m 08s',
    status: 'failed',
    branch: 'hotfix/payment-timeout',
    stages: [
      { name: 'Validate', detail: '29s', status: 'success' },
      { name: 'Unit checks', detail: '1m 05s', status: 'success' },
      { name: 'Build', detail: '2m 12s', status: 'success' },
      { name: 'Security scan', detail: 'Failed', status: 'failed' },
      { name: 'Staging', detail: 'Blocked', status: 'queued' },
      { name: 'Production', detail: 'Blocked', status: 'queued' },
    ],
  },
  runs: [
    {
      id: '#8432',
      service: 'billing-worker',
      branch: 'hotfix/payment-timeout',
      author: 'Maya Chen',
      duration: '4m 08s',
      started: 'Just now',
      status: 'failed',
    },
    ...healthyRuns.slice(1),
  ],
  readiness: {
    environment: 'Production',
    score: 38,
    requiredChecks: '8 / 12',
    openWarnings: '4 blockers',
    changeRisk: 'High',
  },
  deploymentQueue: [],
  agentRegions: [
    { region: 'us-east-1', utilization: 96 },
    { region: 'eu-west-1', utilization: 88 },
    { region: 'sa-east-1', utilization: 0 },
  ],
};

const empty: DashboardSnapshot = {
  ...healthy,
  environmentLabel: 'Workspace ready',
  environmentStatus: 'queued',
  branch: 'No repository connected',
  updatedLabel: 'No pipeline activity yet',
  metrics: [
    { label: 'Success rate', value: '--', detail: 'No data yet', trend: 'neutral' },
    { label: 'Lead time', value: '--', detail: 'No data yet', trend: 'neutral' },
    { label: 'Deploy frequency', value: '0', detail: 'No services connected', trend: 'neutral' },
    { label: 'Active agents', value: '0 / 0', detail: 'No agents registered', trend: 'neutral' },
  ],
  activePipeline: null,
  runs: [],
  readiness: {
    environment: 'Production',
    score: 0,
    requiredChecks: '0 / 0',
    openWarnings: 'None',
    changeRisk: 'Unknown',
  },
  deploymentQueue: [],
  agentRegions: [],
};

export const MOCK_DASHBOARDS: Readonly<
  Record<Exclude<MockScenario, 'offline'>, DashboardSnapshot>
> = {
  healthy,
  degraded,
  incident,
  empty,
};
