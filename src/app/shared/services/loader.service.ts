import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoading = signal<boolean>(false);

  private timeout?: ReturnType<typeof setTimeout>;

  show() {
    this.timeout = setTimeout(() => {
      this.isLoading.set(true);
      document.body.classList.add('loading');
    }, 200);
  }

  hide() {
    clearTimeout(this.timeout);
    this.isLoading.set(false);
    document.body.classList.remove('loading');
  }
}
