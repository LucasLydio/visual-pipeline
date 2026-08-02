-- CreateEnum
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED');

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" UUID NOT NULL,
    "provider" "SourceProvider" NOT NULL,
    "deliveryId" VARCHAR(120) NOT NULL,
    "event" VARCHAR(80) NOT NULL,
    "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'RECEIVED',
    "projectId" UUID,
    "pipelineRunId" UUID,
    "message" VARCHAR(240),
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookDelivery_provider_idx" ON "WebhookDelivery"("provider");

-- CreateIndex
CREATE INDEX "WebhookDelivery_event_idx" ON "WebhookDelivery"("event");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_projectId_idx" ON "WebhookDelivery"("projectId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_pipelineRunId_idx" ON "WebhookDelivery"("pipelineRunId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_receivedAt_idx" ON "WebhookDelivery"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookDelivery_provider_deliveryId_key" ON "WebhookDelivery"("provider", "deliveryId");

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_pipelineRunId_fkey" FOREIGN KEY ("pipelineRunId") REFERENCES "PipelineRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
