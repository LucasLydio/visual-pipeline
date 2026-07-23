import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideRefreshCw, lucideShieldAlert } from '@ng-icons/lucide';

import { SessionRefreshService } from '../../../core/services/session-refresh.service';

@Component({
  selector: 'vp-session-refresh-dialog',
  imports: [NgIcon],
  providers: [provideIcons({ lucideRefreshCw, lucideShieldAlert })],
  templateUrl: './session-refresh-dialog.component.html',
  styleUrl: './session-refresh-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionRefreshDialogComponent {
  protected readonly sessionRefresh = inject(SessionRefreshService);
}
