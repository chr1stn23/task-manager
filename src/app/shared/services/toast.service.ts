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

  show(message: string, type: ToastType = 'info', duration = 3000) {
    this._toast.set({ message, type });

    setTimeout(() => {
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
