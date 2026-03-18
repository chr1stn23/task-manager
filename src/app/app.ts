import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  public authService = inject(AuthService);

  testLogin(email: string, pass: string) {
    this.authService.login({ email, password: pass }).subscribe({
      next: (res) => console.log('Login exitoso', res),
      error: (err) => console.error('Error de login', err),
    });
  }
}
