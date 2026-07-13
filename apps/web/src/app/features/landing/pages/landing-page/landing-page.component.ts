import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';

import { LeadApi } from '../../../../core/api/lead-api';
import { ThemeService } from '../../../../core/services/theme.service';
import { BrandComponent } from '../../../../shared/ui/brand/brand.component';

type SubmissionState = 'idle' | 'success' | 'error';

@Component({
  selector: 'vp-landing-page',
  imports: [BrandComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly leadApi = inject(LeadApi);

  protected readonly theme = inject(ThemeService);
  protected readonly submitting = signal(false);
  protected readonly submissionState = signal<SubmissionState>('idle');
  protected readonly receiptId = signal('');

  protected readonly leadForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    teamSize: ['6-20', Validators.required],
  });

  protected submitLead(): void {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submissionState.set('idle');

    this.leadApi
      .submitLead(this.leadForm.getRawValue())
      .pipe(
        take(1),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: (receipt) => {
          this.receiptId.set(receipt.id);
          this.submissionState.set('success');
          this.leadForm.reset({ name: '', email: '', teamSize: '6-20' });
        },
        error: () => this.submissionState.set('error'),
      });
  }
}
