import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBraces,
  lucideGamepad2,
  lucideGitBranch,
  lucideMonitor,
  lucideRocket,
  lucideUsers,
} from '@ng-icons/lucide';
import {
  simpleAngular,
  simpleBitbucket,
  simpleDocker,
  simpleGithub,
  simpleGitlab,
  simpleTypescript,
} from '@ng-icons/simple-icons';

import { BrandComponent } from '../../../../shared/ui/brand/brand.component';

@Component({
  selector: 'vp-landing-page',
  imports: [BrandComponent, NgIcon, RouterLink],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideBraces,
      lucideGamepad2,
      lucideGitBranch,
      lucideMonitor,
      lucideRocket,
      lucideUsers,
      simpleAngular,
      simpleBitbucket,
      simpleDocker,
      simpleGithub,
      simpleGitlab,
      simpleTypescript,
    }),
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {}
