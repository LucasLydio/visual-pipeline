import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDown,
  lucideArrowUp,
  lucideGripVertical,
  lucidePlus,
  lucideTrash2,
} from '@ng-icons/lucide';

import { PipelineStepDraft } from '../../models/pipeline-step-draft.models';

@Component({
  selector: 'vp-pipeline-step-editor',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideArrowDown,
      lucideArrowUp,
      lucideGripVertical,
      lucidePlus,
      lucideTrash2,
    }),
  ],
  templateUrl: './pipeline-step-editor.component.html',
  styleUrl: './pipeline-step-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineStepEditorComponent {
  @Input() drafts: readonly PipelineStepDraft[] = [];
  @Output() draftsChange = new EventEmitter<readonly PipelineStepDraft[]>();
  private draggedIndex: number | null = null;

  protected addStep(): void {
    this.emitDrafts([
      ...this.drafts,
      {
        clientId: `new-${Date.now()}`,
        name: 'New step',
        command: '',
        order: this.drafts.length + 1,
        isRequired: true,
        isEnabled: true,
      },
    ]);
  }

  protected updateName(clientId: string, event: Event): void {
    this.updateDraft(clientId, { name: (event.target as HTMLInputElement).value });
  }

  protected updateCommand(clientId: string, event: Event): void {
    this.updateDraft(clientId, { command: (event.target as HTMLInputElement).value });
  }

  protected updateFlag(clientId: string, key: 'isRequired' | 'isEnabled', event: Event): void {
    this.updateDraft(clientId, { [key]: (event.target as HTMLInputElement).checked });
  }

  protected removeStep(clientId: string): void {
    this.emitDrafts(this.drafts.filter((draft) => draft.clientId !== clientId));
  }

  protected startDrag(index: number): void {
    this.draggedIndex = index;
  }

  protected allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  protected drop(index: number): void {
    if (this.draggedIndex === null) return;
    if (this.draggedIndex !== index) this.reorder(this.draggedIndex, index);
    this.draggedIndex = null;
  }

  protected move(index: number, direction: -1 | 1): void {
    this.reorder(index, index + direction);
  }

  private updateDraft(clientId: string, patch: Partial<PipelineStepDraft>): void {
    this.emitDrafts(
      this.drafts.map((draft) => (draft.clientId === clientId ? { ...draft, ...patch } : draft)),
    );
  }

  private reorder(from: number, to: number): void {
    const drafts = [...this.drafts];
    if (to < 0 || to >= drafts.length) return;

    const [draft] = drafts.splice(from, 1);
    drafts.splice(to, 0, draft);
    this.emitDrafts(drafts);
  }

  private emitDrafts(drafts: readonly PipelineStepDraft[]): void {
    this.draftsChange.emit(drafts.map((draft, index) => ({ ...draft, order: index + 1 })));
  }
}
