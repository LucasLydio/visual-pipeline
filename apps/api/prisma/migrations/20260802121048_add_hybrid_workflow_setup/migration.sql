-- AlterEnum
ALTER TYPE "PipelineRunTrigger" ADD VALUE 'GITHUB_ACTIONS';

-- AlterTable
ALTER TABLE "PipelineRun" ADD COLUMN     "externalRunId" VARCHAR(120),
ADD COLUMN     "externalRunUrl" TEXT,
ADD COLUMN     "runnerName" VARCHAR(120);

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "workflowEnabledAt" TIMESTAMPTZ(3),
ADD COLUMN     "workflowRotatedAt" TIMESTAMPTZ(3),
ADD COLUMN     "workflowTokenHash" VARCHAR(128);

-- CreateIndex
CREATE INDEX "PipelineRun_externalRunId_idx" ON "PipelineRun"("externalRunId");
