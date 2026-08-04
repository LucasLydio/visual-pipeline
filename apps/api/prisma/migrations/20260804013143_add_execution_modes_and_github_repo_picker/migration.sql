-- CreateEnum
CREATE TYPE "ProjectExecutionMode" AS ENUM ('GITHUB_ACTIONS', 'LOCAL_AGENT', 'MANUAL');

-- AlterTable
ALTER TABLE "AuthAccount" ADD COLUMN     "accessTokenSecret" TEXT,
ADD COLUMN     "scopes" VARCHAR(500),
ADD COLUMN     "tokenUpdatedAt" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "executionMode" "ProjectExecutionMode" NOT NULL DEFAULT 'MANUAL';
