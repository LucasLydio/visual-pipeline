import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SECRET_NAME = 'VISUAL_PIPELINE_TOKEN';
const WORKFLOW_PATH = '.github/workflows/visual-pipeline.yml';

type WorkflowProject = {
  readonly id: string;
  readonly name: string;
  readonly defaultBranch: string;
  readonly pipelines: ReadonlyArray<{
    readonly name: string;
    readonly steps: ReadonlyArray<{
      readonly name: string;
      readonly order: number;
      readonly command: string | null;
      readonly isRequired: boolean;
    }>;
  }>;
};

@Injectable()
export class WorkflowYamlService {
  constructor(private readonly configService: ConfigService) {}

  get secretName(): string {
    return SECRET_NAME;
  }

  get workflowPath(): string {
    return WORKFLOW_PATH;
  }

  apiBaseUrl(): string {
    return (
      this.configService.get<string>('PUBLIC_API_BASE_URL') ??
      this.configService.get<string>('API_PUBLIC_URL') ??
      `http://localhost:${this.configService.get<string>('PORT') ?? '3000'}`
    ).replace(/\/+$/, '');
  }

  build(project: WorkflowProject): string {
    const pipeline = project.pipelines[0];
    const steps = pipeline?.steps ?? [];

    return [
      'name: Visual Pipeline',
      '',
      'on:',
      '  push:',
      '    branches:',
      `      - ${this.yamlScalar(project.defaultBranch)}`,
      '  workflow_dispatch:',
      '',
      'permissions:',
      '  contents: read',
      '',
      'jobs:',
      '  visual-pipeline:',
      '    runs-on: ubuntu-latest',
      '    env:',
      `      VISUAL_PIPELINE_API_URL: ${this.yamlScalar(this.apiBaseUrl())}`,
      `      VISUAL_PIPELINE_PROJECT_ID: ${this.yamlScalar(project.id)}`,
      `      VISUAL_PIPELINE_TOKEN: \${{ secrets.${SECRET_NAME} }}`,
      '    steps:',
      '      - name: Checkout repository',
      '        uses: actions/checkout@v4',
      '',
      ...this.startRunStep(),
      ...steps.flatMap((step) => this.pipelineStep(step)),
      ...this.completeRunStep(),
    ].join('\n');
  }

  private startRunStep(): string[] {
    return [
      '      - name: Start Visual Pipeline run',
      '        id: visual_pipeline',
      '        shell: bash',
      '        run: |',
      '          set -euo pipefail',
      "          payload=$(node -e \"console.log(JSON.stringify({branch: process.env.GITHUB_REF_NAME, commitSha: process.env.GITHUB_SHA, externalRunId: process.env.GITHUB_RUN_ID, externalRunUrl: process.env.GITHUB_SERVER_URL + '/' + process.env.GITHUB_REPOSITORY + '/actions/runs/' + process.env.GITHUB_RUN_ID, runnerName: process.env.RUNNER_NAME}))\")",
      '          response=$(curl -fsS -X POST "$VISUAL_PIPELINE_API_URL/workflow-runs/github/start" -H "content-type: application/json" -H "x-visual-pipeline-project-id: $VISUAL_PIPELINE_PROJECT_ID" -H "x-visual-pipeline-token: $VISUAL_PIPELINE_TOKEN" --data "$payload")',
      '          run_id=$(node -e "const fs = require(\'fs\'); const body = JSON.parse(fs.readFileSync(0, \'utf8\')); process.stdout.write(body.runId)" <<< "$response")',
      '          echo "run_id=$run_id" >> "$GITHUB_OUTPUT"',
      '',
    ];
  }

  private pipelineStep(step: {
    readonly name: string;
    readonly order: number;
    readonly command: string | null;
    readonly isRequired: boolean;
  }): string[] {
    const command = Buffer.from(
      step.command ?? 'echo "No command configured."',
    ).toString('base64');
    const required = step.isRequired ? 'true' : 'false';

    return [
      `      - name: ${this.yamlScalar(`${step.order}. ${step.name}`)}`,
      '        shell: bash',
      '        env:',
      `          VISUAL_PIPELINE_STEP_ORDER: ${step.order}`,
      `          VISUAL_PIPELINE_STEP_REQUIRED: ${required}`,
      `          VISUAL_PIPELINE_COMMAND_B64: ${command}`,
      '        run: |',
      '          set +e',
      '          curl -fsS -X PATCH "$VISUAL_PIPELINE_API_URL/workflow-runs/${{ steps.visual_pipeline.outputs.run_id }}/steps/$VISUAL_PIPELINE_STEP_ORDER/start" -H "x-visual-pipeline-project-id: $VISUAL_PIPELINE_PROJECT_ID" -H "x-visual-pipeline-token: $VISUAL_PIPELINE_TOKEN"',
      "          node -e \"process.stdout.write(Buffer.from(process.env.VISUAL_PIPELINE_COMMAND_B64, 'base64').toString('utf8'))\" > visual-pipeline-command.sh",
      '          bash visual-pipeline-command.sh > visual-pipeline-step.log 2>&1',
      '          exit_code=$?',
      '          status=PASSED',
      '          if [ "$exit_code" -ne 0 ]; then status=FAILED; fi',
      "          body=$(VISUAL_PIPELINE_STATUS=\"$status\" node -e \"const fs = require('fs'); const summary = fs.existsSync('visual-pipeline-step.log') ? fs.readFileSync('visual-pipeline-step.log', 'utf8').slice(-6000) : ''; console.log(JSON.stringify({status: process.env.VISUAL_PIPELINE_STATUS, logsSummary: summary}))\")",
      '          curl -fsS -X PATCH "$VISUAL_PIPELINE_API_URL/workflow-runs/${{ steps.visual_pipeline.outputs.run_id }}/steps/$VISUAL_PIPELINE_STEP_ORDER/complete" -H "content-type: application/json" -H "x-visual-pipeline-project-id: $VISUAL_PIPELINE_PROJECT_ID" -H "x-visual-pipeline-token: $VISUAL_PIPELINE_TOKEN" --data "$body"',
      '          cat visual-pipeline-step.log',
      '          if [ "$VISUAL_PIPELINE_STEP_REQUIRED" = "true" ]; then exit "$exit_code"; fi',
      '',
    ];
  }

  private completeRunStep(): string[] {
    return [
      '      - name: Complete Visual Pipeline run',
      '        if: always()',
      '        shell: bash',
      '        run: |',
      '          set -euo pipefail',
      '          final_status=PASSED',
      '          reason=""',
      '          if [ "${{ job.status }}" = "failure" ]; then final_status=FAILED; reason="GitHub Actions job failed."; fi',
      '          if [ "${{ job.status }}" = "cancelled" ]; then final_status=CANCELED; reason="GitHub Actions job canceled."; fi',
      '          payload=$(VISUAL_PIPELINE_FINAL_STATUS="$final_status" VISUAL_PIPELINE_FAILURE_REASON="$reason" node -e "console.log(JSON.stringify({status: process.env.VISUAL_PIPELINE_FINAL_STATUS, failureReason: process.env.VISUAL_PIPELINE_FAILURE_REASON || undefined}))")',
      '          curl -fsS -X PATCH "$VISUAL_PIPELINE_API_URL/workflow-runs/${{ steps.visual_pipeline.outputs.run_id }}/complete" -H "content-type: application/json" -H "x-visual-pipeline-project-id: $VISUAL_PIPELINE_PROJECT_ID" -H "x-visual-pipeline-token: $VISUAL_PIPELINE_TOKEN" --data "$payload"',
    ];
  }

  private yamlScalar(value: string): string {
    return JSON.stringify(value);
  }
}
