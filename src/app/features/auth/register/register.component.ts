import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { getFieldError } from '../../../shared/utils/form-errors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  submitted = signal(false);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])[A-Za-z\d@#$%^&+=!]+$/),
      ],
    ],
  });

  onRegister() {
    this.submitted.set(true);
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/tasks']);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiError = err.error?.error?.message || 'Error al registrar usuario';
        this.errorMessage.set(apiError);
      },
    });
  }

  labels = {
    name: 'El nombre',
    email: 'El correo',
    password: 'La contraseña',
  };

  getError(field: string): string | null {
    return getFieldError(this.registerForm, field, this.submitted(), this.labels);
  }
}
