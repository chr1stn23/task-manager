import { Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { Role } from '../../../../../shared/models/enums';
import { getFieldError } from '../../../../../shared/utils/form-errors';
import { ToastService } from '../../../../../shared/services/toast.service';
import { LoaderService } from '../../../../../shared/services/loader.service';
import { AdminUsersService } from '../../../services/admin-users.service';
import { UserCreateDTO } from '../../../../../shared/models/request/user-request.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-user-create-page',
  imports: [LucideAngularModule, RouterLink, ReactiveFormsModule],
  templateUrl: './admin-user-create-page.component.html',
  styleUrl: './admin-user-create-page.component.scss',
})
export class AdminUserCreatePageComponent {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  private adminService = inject(AdminUsersService);
  private router = inject(Router);

  availableRoles = Object.values(Role);
  submitted = signal(false);

  readonly icons = {
    back: ArrowLeft,
  };

  createForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    nickName: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    roles: this.fb.array([Role.ROLE_USER], [Validators.required]),
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])[A-Za-z\d@#$%^&+=!]+$/),
      ],
    ],
    enabled: [true, []],
  });

  private getFormValueAsDto(): UserCreateDTO {
    const rawValue = this.createForm.value;
    return {
      firstName: rawValue.firstName,
      lastName: rawValue.lastName,
      nickName: rawValue.nickName,
      email: rawValue.email,
      enabled: rawValue.enabled,
      roles: rawValue.roles,
      password: rawValue.password,
    };
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

    this.rolesArray.markAsDirty();
    this.rolesArray.markAsTouched();
    this.createForm.get('roles')?.updateValueAndValidity();
  }

  get rolesArray() {
    return this.createForm.get('roles') as FormArray;
  }

  labels = {
    firstName: 'El nombre',
    lastName: 'El apellido',
    nickName: 'El nombre de usuario',
    email: 'El correo',
    roles: 'Los roles',
    password: 'La contraseña',
  };

  getError(field: string): string | null {
    return getFieldError(this.createForm, field, this.submitted(), this.labels);
  }

  resetForm(): void {
    this.rolesArray.clear();

    this.rolesArray.push(new FormControl(Role.ROLE_USER));

    this.createForm.reset({
      enabled: true,
      firstName: '',
      lastName: '',
      nickName: '',
      email: '',
      roles: [Role.ROLE_USER],
    });
    this.submitted.set(false);
  }

  private saveUser(callback?: (id: number) => void) {
    this.submitted.set(true);

    if (this.createForm.invalid) {
      this.toast.error('Por favor, revisa los errores en el formulario');
      return;
    }

    this.loader.show();
    const dto = this.getFormValueAsDto();

    this.adminService
      .createUser(dto)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (response) => {
          this.toast.success('Usuario creado exitosamente');
          if (callback && response.data) {
            callback(response.data.id);
          }
        },
      });
  }

  onSubmit(): void {
    this.saveUser((id) => {
      this.router.navigate(['/admin/users', id]);
    });
  }

  onCreateAndNew(): void {
    this.saveUser(() => {
      this.resetForm();
    });
  }
}
