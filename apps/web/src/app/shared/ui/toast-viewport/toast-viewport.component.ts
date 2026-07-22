import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastNotificationService } from '../../../core/services/toast-notification.service';

@Component({
  selector: 'vp-toast-viewport',
  templateUrl: './toast-viewport.component.html',
  styleUrl: './toast-viewport.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastViewportComponent {
  protected readonly toast = inject(ToastNotificationService);
}
