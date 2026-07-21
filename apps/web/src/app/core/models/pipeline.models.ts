export type PipelineStatus = 'success' | 'running' | 'warning' | 'queued' | 'failed';

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

export type SourceProvider = 'GitHub' | 'GitLab' | 'Bitbucket';

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly role: string;
}

export interface QueuedProject {
  readonly id: string;
  readonly name: string;
  readonly repository: string;
  readonly provider: SourceProvider;
  readonly branch: string;
  readonly environment: string;
  readonly status: PipelineStatus;
  readonly queuePosition: number | null;
  readonly queuedAt: string;
  readonly estimate: string;
  readonly responsible: TeamMember;
  readonly members: readonly TeamMember[];
  readonly steps: readonly PipelineStage[];
}

export interface DeploymentRecord {
  readonly id: string;
  readonly project: string;
  readonly environment: string;
  readonly version: string;
  readonly branch: string;
  readonly deployedAt: string;
  readonly responsible: string;
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
  readonly workspaceName: string;
  readonly workspaceStatus: PipelineStatus;
  readonly summary: string;
  readonly updatedLabel: string;
  readonly projects: readonly QueuedProject[];
  readonly deployments: readonly DeploymentRecord[];
}
