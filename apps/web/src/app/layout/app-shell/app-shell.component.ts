import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideHouse, lucideMenu, lucideMoon, lucideSun } from '@ng-icons/lucide';

import { ThemeService } from '../../core/services/theme.service';
import { WorkspaceContextService } from '../../core/services/workspace-context.service';
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
  protected readonly workspaceContext = inject(WorkspaceContextService);
  protected readonly sidebarOpen = signal(false);
  protected readonly activeNavigation = signal('Overview');

  protected readonly navigation: readonly NavigationItem[] = [
    { label: 'Overview', fragment: 'overview' },
    { label: 'Repositories', fragment: 'repositories' },
    { label: 'Team', fragment: 'team' },
  ];

  protected readonly state = this.workspaceContext.state;
  protected readonly workspaceName = computed(
    () => this.state().overview?.activeTeam?.name ?? 'Workspace setup',
  );
  protected readonly workspaceSubtitle = computed(() => {
    const activeTeam = this.state().overview?.activeTeam;

    if (!this.workspaceContext.isAuthenticated()) return 'Login required';
    if (this.state().loading) return 'Loading workspace';
    if (!activeTeam) return 'Create your first team';

    return `${activeTeam.memberCount} members - ${this.formatRole(activeTeam.currentUserRole)}`;
  });
  protected readonly workspaceInitials = computed(() => this.initials(this.workspaceName()));
  protected readonly profileName = computed(
    () => this.state().overview?.currentUser.displayName ?? 'Not logged in',
  );
  protected readonly profileSubtitle = computed(() => {
    const activeTeam = this.state().overview?.activeTeam;

    if (!this.workspaceContext.isAuthenticated()) return 'Connect account';
    if (!activeTeam) return 'No team selected';

    return this.formatRole(activeTeam.currentUserRole);
  });
  protected readonly profileInitials = computed(() => this.initials(this.profileName()));
  protected readonly activeRepositoryCount = computed(
    () =>
      this.state().overview?.projects.filter((project) => project.status !== 'ARCHIVED').length ??
      0,
  );
  protected readonly archivedRepositoryCount = computed(
    () =>
      this.state().overview?.projects.filter((project) => project.status === 'ARCHIVED').length ??
      0,
  );
  protected readonly agentSummary = computed(() => {
    if (!this.workspaceContext.isAuthenticated()) return 'Waiting for login';
    if (this.state().loading) return 'Syncing workspace';

    return `${this.activeRepositoryCount()} active repositories`;
  });

  protected toggleSidebar(): void {
    this.sidebarOpen.update((isOpen) => !isOpen);
  }

  protected selectNavigation(item: NavigationItem): void {
    this.activeNavigation.set(item.label);
    this.sidebarOpen.set(false);
  }

  private initials(value: string): string {
    const words = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

    return (words.map((word) => word[0]).join('') || 'VP').toUpperCase();
  }

  private formatRole(role: string): string {
    return role
      .toLowerCase()
      .split('_')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }
}
