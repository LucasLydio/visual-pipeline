import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { AgentConfigService } from './agent-config.service';

export interface LocalCommandResult {
  readonly status: 'PASSED' | 'FAILED';
  readonly logsSummary: string;
}

export type LocalCommandOutputHandler = (logsSummary: string) => void;

@Injectable()
export class LocalCommandExecutorService {
  constructor(private readonly config: AgentConfigService) {}

  execute(
    command: string,
    projectSlug: string,
    onOutput?: LocalCommandOutputHandler,
  ): Promise<LocalCommandResult> {
    const cwd = this.projectDirectory(projectSlug);

    return new Promise((resolveResult) => {
      const child = spawn(command, {
        cwd,
        shell: true,
        windowsHide: true,
        env: {
          ...process.env,
          NODE_ENV: this.config.projectNodeEnv,
        },
      });
      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
      }, this.config.stepTimeoutMs);
      let output = '';
      let lastUpdate = 0;

      const append = (chunk: Buffer): void => {
        output = `${output}${chunk.toString('utf8')}`.slice(-6000);
        const now = Date.now();
        if (onOutput && now - lastUpdate > 1000) {
          lastUpdate = now;
          onOutput(output.trim());
        }
      };

      child.stdout.on('data', append);
      child.stderr.on('data', append);
      child.on('close', (code, signal) => {
        clearTimeout(timeout);
        const timedOut = signal === 'SIGTERM';
        const status = code === 0 && !timedOut ? 'PASSED' : 'FAILED';
        const suffix = timedOut
          ? `\nCommand timed out after ${this.config.stepTimeoutMs}ms.`
          : `\nCommand exited with code ${code ?? 'unknown'}.`;
        const logsSummary = `${output}${suffix}`.trim();

        onOutput?.(logsSummary);

        resolveResult({
          status,
          logsSummary,
        });
      });
      child.on('error', (error) => {
        clearTimeout(timeout);
        resolveResult({
          status: 'FAILED',
          logsSummary: error.message,
        });
      });
    });
  }

  private projectDirectory(projectSlug: string): string {
    const root = resolve(this.config.workspaceRoot);
    const projectPath = resolve(root, projectSlug);

    if (!projectPath.startsWith(root)) {
      throw new Error('Resolved project path escaped workspace root.');
    }

    return projectPath;
  }
}
