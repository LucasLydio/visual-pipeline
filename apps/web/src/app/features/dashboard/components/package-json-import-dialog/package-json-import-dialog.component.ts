import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideGripVertical,
  lucideTrash2,
  lucideUpload,
  lucideX,
} from '@ng-icons/lucide';

import { PackageScriptImportStep } from '../../models/package-json-import.models';

interface ScriptDraft {
  readonly id: string;
  readonly name: string;
  readonly command: string;
  readonly included: boolean;
}

interface ScriptReviewRow extends ScriptDraft {
  readonly order: number | null;
}

@Component({
  selector: 'vp-package-json-import-dialog',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideArrowDown,
      lucideArrowUp,
      lucideGripVertical,
      lucideTrash2,
      lucideUpload,
      lucideX,
    }),
  ],
  templateUrl: './package-json-import-dialog.component.html',
  styleUrl: './package-json-import-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageJsonImportDialogComponent {
  @Input() targetLabel = 'pipeline';
  @Input() existingOrders: readonly number[] = [];
  @Output() imported = new EventEmitter<readonly PackageScriptImportStep[]>();
  @Output() closed = new EventEmitter<void>();

  protected readonly fileName = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly scripts = signal<readonly ScriptDraft[]>([]);
  protected readonly confirming = signal(false);
  private draggedIndex: number | null = null;

  protected async loadPackage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    this.resetImport(file.name);
    if (file.name.toLowerCase() !== 'package.json') {
      this.error.set('Only package.json files can be imported.');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text()) as unknown;
    } catch {
      this.error.set('The selected package.json is not valid JSON.');
      return;
    }

    try {
      this.scripts.set(this.readScripts(parsed));
    } catch {
      this.error.set('package.json must include a scripts object with string commands.');
    }
  }

  protected previewSteps(): readonly PackageScriptImportStep[] {
    const includedScripts = this.scripts().filter((script) => script.included);
    const orders = this.availableOrders(includedScripts.length);

    return includedScripts.map((script, index) => ({
      ...script,
      name: script.name.trim(),
      command: script.command.trim(),
      order: orders[index],
    }));
  }

  protected reviewRows(): readonly ScriptReviewRow[] {
    const orderedScripts = this.previewSteps();
    const orderById = new Map(orderedScripts.map((script) => [script.id, script.order]));

    return this.scripts().map((script) => ({
      ...script,
      order: orderById.get(script.id) ?? null,
    }));
  }

  protected toggleIncluded(scriptId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateScript(scriptId, { included: checked });
  }

  protected updateName(scriptId: string, event: Event): void {
    const name = (event.target as HTMLInputElement).value;
    this.updateScript(scriptId, { name });
  }

  protected updateCommand(scriptId: string, event: Event): void {
    const command = (event.target as HTMLInputElement).value;
    this.updateScript(scriptId, { command });
  }

  protected removeScript(scriptId: string): void {
    this.scripts.update((scripts) => scripts.filter((script) => script.id !== scriptId));
    this.confirming.set(false);
  }

  protected startDrag(index: number): void {
    this.draggedIndex = index;
    this.confirming.set(false);
  }

  protected allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  protected drop(index: number): void {
    if (this.draggedIndex === null) return;
    if (this.draggedIndex === index) {
      this.draggedIndex = null;
      return;
    }

    this.reorder(this.draggedIndex, index);
    this.draggedIndex = null;
  }

  protected move(index: number, direction: -1 | 1): void {
    this.reorder(index, index + direction);
  }

  protected requestConfirmation(): void {
    const steps = this.previewSteps();
    if (this.scripts().length === 0) {
      this.error.set('Import a package.json with scripts before continuing.');
      return;
    }
    if (steps.length === 0) {
      this.error.set('Select at least one script before importing.');
      return;
    }
    if (steps.some((step) => step.name.length < 2 || step.command.length === 0)) {
      this.error.set('Selected scripts need a name and command before importing.');
      return;
    }

    this.error.set(null);
    this.confirming.set(true);
  }

  protected confirmImport(): void {
    this.imported.emit(this.previewSteps());
  }

  private resetImport(fileName: string): void {
    this.fileName.set(fileName);
    this.error.set(null);
    this.scripts.set([]);
    this.confirming.set(false);
  }

  private readScripts(parsed: unknown): readonly ScriptDraft[] {
    if (!this.isRecord(parsed) || !this.isRecord(parsed['scripts'])) {
      throw new Error('Missing package scripts.');
    }

    const scripts = Object.entries(parsed['scripts']).map(([name, command], index) => {
      if (typeof command !== 'string' || command.trim().length === 0) {
        throw new Error('Invalid script command.');
      }

      return {
        id: `${index}-${name}`,
        name,
        command: command.trim(),
        included: true,
      };
    });

    if (scripts.length === 0) throw new Error('Missing package scripts.');
    return scripts;
  }

  private reorder(from: number, to: number): void {
    const current = [...this.scripts()];
    if (to < 0 || to >= current.length) return;

    const [item] = current.splice(from, 1);
    current.splice(to, 0, item);
    this.scripts.set(current);
    this.confirming.set(false);
  }

  private updateScript(scriptId: string, patch: Partial<ScriptDraft>): void {
    this.scripts.update((scripts) =>
      scripts.map((script) => (script.id === scriptId ? { ...script, ...patch } : script)),
    );
    this.error.set(null);
    this.confirming.set(false);
  }

  private availableOrders(count: number): number[] {
    const usedOrders = new Set(this.existingOrders);
    const orders: number[] = [];

    for (let order = 1; orders.length < count; order += 1) {
      if (usedOrders.has(order)) continue;
      orders.push(order);
      usedOrders.add(order);
    }

    return orders;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
