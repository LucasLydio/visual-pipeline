import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePipelineDto } from './dto/create-pipeline.dto.js';
import { CreatePipelineStepDto } from './dto/create-pipeline-step.dto.js';
import { CreatePipelineTemplateDto } from './dto/create-pipeline-template.dto.js';
import { CreatePipelineTemplateStepDto } from './dto/create-pipeline-template-step.dto.js';
import { UpdatePipelineStepDto } from './dto/update-pipeline-step.dto.js';
import { UpdatePipelineTemplateStepDto } from './dto/update-pipeline-template-step.dto.js';
import {
  PipelineStepRecord,
  TemplateStepRecord,
} from './pipelines.repository.js';

@Injectable()
export class PipelineStepsPolicy {
  normalizeTemplateSteps(
    steps: CreatePipelineTemplateDto['steps'] = [],
  ): TemplateStepRecord[] {
    return steps.map((step, index) =>
      this.normalizeTemplateStep(step, index + 1),
    );
  }

  normalizePipelineSteps(
    steps: CreatePipelineDto['steps'] = [],
  ): PipelineStepRecord[] {
    return steps.map((step, index) =>
      this.normalizePipelineStep(step, index + 1),
    );
  }

  normalizeTemplateStep(
    step: CreatePipelineTemplateStepDto,
    fallbackOrder: number,
  ): TemplateStepRecord {
    return {
      name: this.normalizeName(step.name),
      description: this.normalizeDescription(step.description),
      order: this.normalizeOrder(step.order ?? fallbackOrder),
      command: this.normalizeNullableCommand(step.command),
      isRequired: step.isRequired ?? true,
      isEnabled: step.isEnabled ?? true,
    };
  }

  normalizeTemplateStepUpdate(
    step: UpdatePipelineTemplateStepDto,
  ): Partial<TemplateStepRecord> {
    return this.cleanUndefined({
      name: step.name === undefined ? undefined : this.normalizeName(step.name),
      description:
        step.description === undefined
          ? undefined
          : this.normalizeNullableDescription(step.description),
      order:
        step.order === undefined ? undefined : this.normalizeOrder(step.order),
      command:
        step.command === undefined
          ? undefined
          : this.normalizeNullableCommand(step.command),
      isRequired: step.isRequired,
      isEnabled: step.isEnabled,
    });
  }

  normalizePipelineStep(
    step: CreatePipelineStepDto,
    fallbackOrder: number,
  ): PipelineStepRecord {
    return {
      name: this.normalizeName(step.name),
      order: this.normalizeOrder(step.order ?? fallbackOrder),
      command: this.normalizeNullableCommand(step.command),
      isRequired: step.isRequired ?? true,
      isEnabled: step.isEnabled ?? true,
    };
  }

  normalizePipelineStepUpdate(
    step: UpdatePipelineStepDto,
  ): Partial<PipelineStepRecord> {
    return this.cleanUndefined({
      name: step.name === undefined ? undefined : this.normalizeName(step.name),
      order:
        step.order === undefined ? undefined : this.normalizeOrder(step.order),
      command:
        step.command === undefined
          ? undefined
          : this.normalizeNullableCommand(step.command),
      isRequired: step.isRequired,
      isEnabled: step.isEnabled,
    });
  }

  templateStepToPipelineStep(step: TemplateStepRecord): PipelineStepRecord {
    return {
      name: step.name,
      order: step.order,
      command: step.command,
      isRequired: step.isRequired,
      isEnabled: step.isEnabled,
    };
  }

  ensureStepOrderAvailable(
    steps: readonly { id: string; order: number }[],
    order: number,
    ignoreStepId?: string,
  ): void {
    const existing = steps.find(
      (step) => step.order === order && step.id !== ignoreStepId,
    );
    if (existing) throw new ConflictException('Step order is already in use.');
  }

  private normalizeName(value: string | undefined): string {
    const normalized = value?.trim();
    if (!normalized || normalized.length < 2 || normalized.length > 120) {
      throw new BadRequestException(
        'Step name must be between 2 and 120 characters.',
      );
    }
    return normalized;
  }

  private normalizeDescription(value?: string): string | undefined {
    return this.normalizeNullableDescription(value) ?? undefined;
  }

  private normalizeNullableDescription(value?: string | null): string | null {
    const normalized = value?.trim();
    if (!normalized) return null;
    if (normalized.length > 240) {
      throw new BadRequestException(
        'Description must have at most 240 characters.',
      );
    }
    return normalized;
  }

  private normalizeNullableCommand(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized || null;
  }

  private normalizeOrder(order: number): number {
    if (!Number.isInteger(order) || order < 1) {
      throw new BadRequestException('Step order must be a positive integer.');
    }
    return order;
  }

  private cleanUndefined<T extends Record<string, unknown>>(data: T): T {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as T;
  }
}
