import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'vp-brand',
  imports: [RouterLink],
  template: `
    <a class="brand" [class.inverted]="inverted()" [routerLink]="link()">
      <span class="mark" aria-hidden="true"><span></span><span></span><span></span></span>
      <span>Visual Pipeline</span>
    </a>
  `,
  styles: `
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.7rem;
      color: var(--color-text);
      font-size: 0.96rem;
      font-weight: 700;
      text-decoration: none;
    }

    .brand.inverted {
      color: var(--white);
    }

    .mark {
      display: grid;
      width: 1.75rem;
      height: 1.75rem;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.2rem;
      flex: 0 0 auto;
    }

    .mark span {
      background: var(--color-primary);
      border-radius: 0.2rem;
    }

    .mark span:first-child {
      grid-row: span 2;
    }

    .mark span:last-child {
      background: var(--color-accent);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {
  readonly inverted = input(false);
  readonly link = input('/');
}
