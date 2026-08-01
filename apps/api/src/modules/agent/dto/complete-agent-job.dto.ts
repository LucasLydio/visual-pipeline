import type { AgentJobFinalStatus } from '../agent.types.js';

export class CompleteAgentJobDto {
  status?: AgentJobFinalStatus;
  failureReason?: string;
}
