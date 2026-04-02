import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../../shared/services/loader.service';
import { finalize } from 'rxjs';
import { getFieldError } from '../../../../shared/utils/form-errors';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-profile-security',
  imports: [ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './profile-security.component.html',
  styleUrl: './profile-security.component.scss',
})
export class ProfileSecurityComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private router = inject(Router);
  loader = inject(LoaderService);

  submitted = signal<boolean>(false);

  showDisableConfirm = signal<boolean>(false);

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    if (!newPassword.value || !confirmPassword.value) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { notSame: true };
  };

  passwordForm: FormGroup = this.fb.group(
    {
      oldPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])[A-Za-z\d@#$%^&+=!]+$/,
          ),
        ],
      ],
      confirmPassword: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(20)],
      ],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  onChangePassword(): void {
    this.submitted.set(true);
    if (this.passwordForm.invalid || this.loader.isLoading()) return;

    this.loader.show();
    const { oldPassword, newPassword } = this.passwordForm.value;

    this.userService
      .changePassword({ oldPassword, newPassword })
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.success('Contraseña actualizada correctamente');
            this.passwordForm.reset();
            this.submitted.set(false);
          }
        },
      });
  }

  onDisableAccount(): void {
    this.showDisableConfirm.set(true);
  }

  confirmDisableAccount(): void {
    this.loader.show();
    this.userService
      .disableUser()
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.success('Cuenta deshabilitada correctamente');
            this.showDisableConfirm.set(false);
            this.router.navigate(['/login']);
          }
        },
      });
  }

  cancelDisableAccount(): void {
    this.showDisableConfirm.set(false);
  }

  labels = {
    oldPassword: 'La contraseña actual',
    newPassword: 'La nueva contraseña',
    confirmPassword: 'La confirmación',
  };

  getError(field: string): string | null {
    const confirmPassword = this.passwordForm.get('confirmPassword');

    if (field === 'confirmPassword') {
      if (this.passwordForm.hasError('notSame') && confirmPassword?.touched) {
        return 'Las contraseñas no coinciden';
      }

      return getFieldError(this.passwordForm, field, this.submitted(), this.labels);
    }

    return getFieldError(this.passwordForm, field, this.submitted(), this.labels);
  }
}
