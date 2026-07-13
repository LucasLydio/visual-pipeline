export type PipelineStatus = 'success' | 'running' | 'warning' | 'queued' | 'failed';

export type MockScenario = 'healthy' | 'degraded' | 'incident' | 'empty' | 'offline';

export interface Metric {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly trend: 'positive' | 'neutral' | 'negative';
}

export interface PipelineStage {
  readonly name: string;
  readonly detail: string;
  readonly status: PipelineStatus;
}

export interface PipelineRun {
  readonly id: string;
  readonly service: string;
  readonly branch: string;
  readonly author: string;
  readonly duration: string;
  readonly started: string;
  readonly status: PipelineStatus;
}

export interface ActivePipeline {
  readonly id: string;
  readonly service: string;
  readonly commitMessage: string;
  readonly duration: string;
  readonly status: PipelineStatus;
  readonly author: string;
  readonly authorInitials: string;
  readonly commit: string;
  readonly branch: string;
  readonly stages: readonly PipelineStage[];
}

export interface ReleaseReadiness {
  readonly environment: string;
  readonly score: number;
  readonly requiredChecks: string;
  readonly openWarnings: string;
  readonly changeRisk: string;
}

export interface DeploymentQueueItem {
  readonly service: string;
  readonly environment: string;
  readonly state: string;
  readonly estimate: string;
}

export interface AgentRegion {
  readonly region: string;
  readonly utilization: number;
}

export interface DashboardSnapshot {
  readonly environmentLabel: string;
  readonly environmentStatus: PipelineStatus;
  readonly branch: string;
  readonly updatedLabel: string;
  readonly metrics: readonly Metric[];
  readonly activePipeline: ActivePipeline | null;
  readonly runs: readonly PipelineRun[];
  readonly readiness: ReleaseReadiness;
  readonly deploymentQueue: readonly DeploymentQueueItem[];
  readonly agentRegions: readonly AgentRegion[];
}

export interface MockScenarioOption {
  readonly id: MockScenario;
  readonly label: string;
  readonly description: string;
}
