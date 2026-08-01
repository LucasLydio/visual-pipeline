-- CreateEnum
CREATE TYPE "PipelineRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PipelineRunTrigger" AS ENUM ('MANUAL', 'GITHUB_WEBHOOK', 'AGENT', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "PipelineStepRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED', 'CANCELED');

-- CreateTable
CREATE TABLE "PipelineRun" (
    "id" UUID NOT NULL,
    "pipelineId" UUID NOT NULL,
    "triggeredById" UUID,
    "status" "PipelineRunStatus" NOT NULL DEFAULT 'QUEUED',
    "trigger" "PipelineRunTrigger" NOT NULL DEFAULT 'MANUAL',
    "branch" VARCHAR(120) NOT NULL DEFAULT 'main',
    "commitSha" VARCHAR(64),
    "failureReason" VARCHAR(240),
    "queuedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMPTZ(3),
    "finishedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PipelineRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineStepRun" (
    "id" UUID NOT NULL,
    "pipelineRunId" UUID NOT NULL,
    "pipelineStepId" UUID,
    "name" VARCHAR(120) NOT NULL,
    "order" INTEGER NOT NULL,
    "command" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" "PipelineStepRunStatus" NOT NULL DEFAULT 'QUEUED',
    "logsSummary" TEXT,
    "startedAt" TIMESTAMPTZ(3),
    "finishedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PipelineStepRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PipelineRun_pipelineId_idx" ON "PipelineRun"("pipelineId");

-- CreateIndex
CREATE INDEX "PipelineRun_triggeredById_idx" ON "PipelineRun"("triggeredById");

-- CreateIndex
CREATE INDEX "PipelineRun_status_idx" ON "PipelineRun"("status");

-- CreateIndex
CREATE INDEX "PipelineRun_trigger_idx" ON "PipelineRun"("trigger");

-- CreateIndex
CREATE INDEX "PipelineRun_queuedAt_idx" ON "PipelineRun"("queuedAt");

-- CreateIndex
CREATE INDEX "PipelineStepRun_pipelineRunId_idx" ON "PipelineStepRun"("pipelineRunId");

-- CreateIndex
CREATE INDEX "PipelineStepRun_pipelineStepId_idx" ON "PipelineStepRun"("pipelineStepId");

-- CreateIndex
CREATE INDEX "PipelineStepRun_status_idx" ON "PipelineStepRun"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineStepRun_pipelineRunId_order_key" ON "PipelineStepRun"("pipelineRunId", "order");

-- AddForeignKey
ALTER TABLE "PipelineRun" ADD CONSTRAINT "PipelineRun_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineRun" ADD CONSTRAINT "PipelineRun_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineStepRun" ADD CONSTRAINT "PipelineStepRun_pipelineRunId_fkey" FOREIGN KEY ("pipelineRunId") REFERENCES "PipelineRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineStepRun" ADD CONSTRAINT "PipelineStepRun_pipelineStepId_fkey" FOREIGN KEY ("pipelineStepId") REFERENCES "PipelineStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
