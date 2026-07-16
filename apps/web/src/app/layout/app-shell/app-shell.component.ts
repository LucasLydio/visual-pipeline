import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideHouse, lucideMenu, lucideMoon, lucideSun } from '@ng-icons/lucide';

import { ThemeService } from '../../core/services/theme.service';
import { BrandComponent } from '../../shared/ui/brand/brand.component';

interface NavigationItem {
  readonly label: string;
  readonly fragment: string;
}

@Component({
  selector: 'vp-app-shell',
  imports: [BrandComponent, NgIcon, RouterLink, RouterOutlet],
  providers: [provideIcons({ lucideBell, lucideHouse, lucideMenu, lucideMoon, lucideSun })],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly sidebarOpen = signal(false);
  protected readonly activeNavigation = signal('Overview');

  protected readonly navigation: readonly NavigationItem[] = [
    { label: 'Overview', fragment: 'overview' },
    { label: 'Projects', fragment: 'pipelines' },
    { label: 'Deployments', fragment: 'deployments' },
  ];

  protected toggleSidebar(): void {
    this.sidebarOpen.update((isOpen) => !isOpen);
  }

  protected selectNavigation(item: NavigationItem): void {
    this.activeNavigation.set(item.label);
    this.sidebarOpen.set(false);
  }
}
