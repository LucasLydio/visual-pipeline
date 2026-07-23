import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionRefreshDialogComponent } from './shared/ui/session-refresh-dialog/session-refresh-dialog.component';
import { ToastViewportComponent } from './shared/ui/toast-viewport/toast-viewport.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionRefreshDialogComponent, ToastViewportComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
