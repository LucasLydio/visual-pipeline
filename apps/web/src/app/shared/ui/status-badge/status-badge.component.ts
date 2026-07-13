import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PipelineStatus } from '../../../core/models/pipeline.models';

@Component({
  selector: 'vp-status-badge',
  template: `<span [class]="'badge status--' + status()"><span></span>{{ text() }}</span>`,
  styles: `
    .badge {
      display: inline-flex;
      width: max-content;
      min-height: 1.75rem;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.55rem;
      background: var(--color-surface-soft);
      color: var(--color-text-muted);
      border: 1px solid var(--color-border);
      border-radius: 2rem;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: capitalize;
    }

    .badge > span {
      width: 0.4rem;
      height: 0.4rem;
      background: currentColor;
      border-radius: 50%;
    }

    .status--success,
    .status--running {
      color: var(--color-primary);
    }

    .status--warning {
      color: color-mix(in srgb, var(--color-accent) 55%, var(--color-text));
    }

    .status--failed {
      color: color-mix(in srgb, var(--color-accent) 78%, var(--graphite));
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly status = input.required<PipelineStatus>();
  readonly label = input<string>();
  readonly text = computed(() => this.label() ?? this.status());
}
