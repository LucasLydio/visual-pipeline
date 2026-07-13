import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly current = signal<Theme>('light');

  constructor() {
    const savedTheme = this.document.defaultView?.localStorage.getItem('theme');

    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.set(savedTheme);
    }
  }

  toggle(): void {
    this.set(this.current() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.current.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.defaultView?.localStorage.setItem('theme', theme);
  }
}
