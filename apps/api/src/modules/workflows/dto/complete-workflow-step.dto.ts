import type { WorkflowStepFinalStatus } from '../workflows.types.js';

export class CompleteWorkflowStepDto {
  status?: WorkflowStepFinalStatus;
  logsSummary?: string;
}
