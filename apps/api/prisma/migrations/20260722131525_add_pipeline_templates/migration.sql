-- AlterTable
ALTER TABLE "Pipeline" ADD COLUMN     "templateId" UUID;

-- AlterTable
ALTER TABLE "PipelineStep" ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "ownerId" UUID;

-- CreateTable
CREATE TABLE "PipelineTemplate" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "name" VARCHAR(140) NOT NULL,
    "description" VARCHAR(240),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PipelineTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineTemplateStep" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(240),
    "order" INTEGER NOT NULL,
    "command" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PipelineTemplateStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PipelineTemplate_teamId_idx" ON "PipelineTemplate"("teamId");

-- CreateIndex
CREATE INDEX "PipelineTemplate_createdById_idx" ON "PipelineTemplate"("createdById");

-- CreateIndex
CREATE INDEX "PipelineTemplate_isActive_idx" ON "PipelineTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineTemplate_teamId_name_key" ON "PipelineTemplate"("teamId", "name");

-- CreateIndex
CREATE INDEX "PipelineTemplateStep_templateId_idx" ON "PipelineTemplateStep"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineTemplateStep_templateId_order_key" ON "PipelineTemplateStep"("templateId", "order");

-- CreateIndex
CREATE INDEX "Pipeline_templateId_idx" ON "Pipeline"("templateId");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineTemplate" ADD CONSTRAINT "PipelineTemplate_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineTemplate" ADD CONSTRAINT "PipelineTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineTemplateStep" ADD CONSTRAINT "PipelineTemplateStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PipelineTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PipelineTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
