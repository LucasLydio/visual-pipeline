import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogIn } from '@ng-icons/lucide';
import { simpleGithub } from '@ng-icons/simple-icons';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'vp-login-guide',
  imports: [NgIcon],
  providers: [provideIcons({ lucideLogIn, simpleGithub })],
  templateUrl: './login-guide.component.html',
  styleUrl: './login-guide.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginGuideComponent {
  protected readonly githubLoginUrl = `${environment.apiBaseUrl}/auth/github?redirectTo=/app`;
}
