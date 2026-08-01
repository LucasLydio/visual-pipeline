import type { AgentStepFinalStatus } from '../agent.types.js';

export class CompleteAgentStepDto {
  status?: AgentStepFinalStatus;
  logsSummary?: string;
}
