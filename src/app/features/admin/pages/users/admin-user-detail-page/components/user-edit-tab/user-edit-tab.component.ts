import { Component, inject, input, signal, OnInit, output } from '@angular/core';
import { UserResponseDTO } from '../../../../../../../shared/models/response/user-response.model';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { getFieldError } from '../../../../../../../shared/utils/form-errors';
import { Role } from '../../../../../../../shared/models/enums';
import { AdminUsersService } from '../../../../../services/admin-users.service';
import { LoaderService } from '../../../../../../../shared/services/loader.service';
import { ToastService } from '../../../../../../../shared/services/toast.service';
import { finalize } from 'rxjs';
import { ConfirmModalComponent } from '../../../../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-user-edit-tab',
  imports: [ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './user-edit-tab.component.html',
  styleUrl: './user-edit-tab.component.scss',
})
export class UserEditTabComponent implements OnInit {
  user = input<UserResponseDTO>();

  userUpdated = output<UserResponseDTO>();

  submitted = signal(false);
  resetPassSubmitted = signal(false);

  availableRoles = Object.values(Role);

  showResetModal = signal(false);

  private fb = inject(FormBuilder);
  private adminUsersService = inject(AdminUsersService);
  private loader = inject(LoaderService);
  private toast = inject(ToastService);

  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    nickName: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    roles: this.fb.array([], [Validators.required]),
  });

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

  resetPasswordForm: FormGroup = this.fb.group(
    {
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

  ngOnInit(): void {
    this.resetForm();
  }

  get rolesArray() {
    return this.profileForm.get('roles') as FormArray;
  }

  onRoleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const role = target.value;

    if (target.checked) {
      this.rolesArray.push(new FormControl(role));
    } else {
      const index = this.rolesArray.controls.findIndex((x) => x.value === role);
      this.rolesArray.removeAt(index);
    }
  }

  resetForm(): void {
    const user = this.user();
    if (user) {
      this.rolesArray.clear();

      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        nickName: user.nickName,
        email: user.email,
      });

      user.roles.forEach((role) => {
        this.rolesArray.push(new FormControl(role));
      });

      this.submitted.set(false);
    }
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.profileForm.valid) {
      const currentUser = this.user();
      if (!currentUser) return;

      this.loader.show();

      const updateRequest = {
        firstName: this.profileForm.get('firstName')?.value,
        lastName: this.profileForm.get('lastName')?.value,
        nickName: this.profileForm.get('nickName')?.value,
        email: this.profileForm.get('email')?.value,
        roles: this.profileForm.get('roles')?.value,
      };

      this.adminUsersService
        .updateUserById(updateRequest, currentUser.id)
        .pipe(
          finalize(() => {
            this.loader.hide();
            this.submitted.set(false);
          }),
        )
        .subscribe({
          next: (response) => {
            if (response.data) {
              this.userUpdated.emit(response.data);
            }
            this.toast.success('Usuario actualizado correctamente.');
          },
        });
    }
  }

  openResetPasswordModal(): void {
    if (this.resetPasswordForm.valid) {
      this.showResetModal.set(true);
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  confirmResetPassword(): void {
    this.resetPassSubmitted.set(true);

    const currentUser = this.user();
    if (!currentUser) return;

    this.showResetModal.set(false);
    this.loader.show();

    const request = {
      newPassword: this.resetPasswordForm.get('newPassword')?.value,
    };

    this.adminUsersService
      .resetPassword(currentUser.id, request)
      .pipe(
        finalize(() => {
          this.loader.hide();
          this.resetPassSubmitted.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.toast.success('Contraseña restablecida correctamente.');
          this.resetPasswordForm.reset();
        },
      });
  }

  cancelResetModal(): void {
    this.showResetModal.set(false);
  }

  labels = {
    firstName: 'El nombre',
    lastName: 'El apellido',
    nickName: 'El nombre de usuario',
    email: 'El correo',
    roles: 'Los roles',
    newPassword: 'La nueva contraseña',
    confirmPassword: 'La confirmación',
  };

  getError(field: string): string | null {
    return getFieldError(this.profileForm, field, this.submitted(), this.labels);
  }

  getPassError(field: string): string | null {
    const confirmPassword = this.resetPasswordForm.get('confirmPassword');

    if (field === 'confirmPassword') {
      if (this.resetPasswordForm.hasError('notSame') && confirmPassword?.touched) {
        return 'Las contraseñas no coinciden';
      }

      return getFieldError(this.resetPasswordForm, field, this.resetPassSubmitted(), this.labels);
    }

    return getFieldError(this.resetPasswordForm, field, this.resetPassSubmitted(), this.labels);
  }
}
