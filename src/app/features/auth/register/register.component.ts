import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { getFieldError } from '../../../shared/utils/form-errors';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private router = inject(Router);

  loader = inject(LoaderService);

  submitted = signal(false);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    nickName: ['', [Validators.required, Validators.maxLength(30)]],
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

    this.loader.show();

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/tasks']);
        }

        this.loader.hide();
      },
      error: () => {
        this.loader.hide();
      },
    });
  }

  labels = {
    firstName: 'El nombre',
    lastName: 'El apellido',
    nickName: 'El nombre de usuario',
    email: 'El correo',
    password: 'La contraseña',
  };

  getError(field: string): string | null {
    return getFieldError(this.registerForm, field, this.submitted(), this.labels);
  }
}
