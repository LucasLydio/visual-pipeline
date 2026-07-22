import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  readonly id: number;
  readonly type: ToastType;
  readonly message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastNotificationService {
  private nextId = 1;
  readonly messages = signal<readonly ToastMessage[]>([]);

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  private push(type: ToastType, message: string): void {
    const id = this.nextId++;
    this.messages.update((messages) => [...messages, { id, type, message }]);
    window.setTimeout(() => this.dismiss(id), 4200);
  }
}
