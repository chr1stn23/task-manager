import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _toast = signal<Toast | null>(null);
  toast = this._toast.asReadonly();

  private lastMessage: string | null = null;
  private lastTimestamp = 0;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private readonly DUPLICATE_WINDOW = 2000;

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const now = Date.now();

    if (this.lastMessage === message && now - this.lastTimestamp < this.DUPLICATE_WINDOW) {
      return;
    }

    this.lastMessage = message;
    this.lastTimestamp = now;

    this._toast.set({ message, type });

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this._toast.set(null);
    }, duration);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }
}
