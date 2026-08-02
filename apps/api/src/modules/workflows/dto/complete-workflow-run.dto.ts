import type { WorkflowRunFinalStatus } from '../workflows.types.js';

export class CompleteWorkflowRunDto {
  status?: WorkflowRunFinalStatus;
  failureReason?: string;
}
