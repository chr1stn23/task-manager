import { Component, inject, input, signal, OnInit, output } from '@angular/core';
import { UserResponseDTO } from '../../../../../../../shared/models/response/user-response.model';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { getFieldError } from '../../../../../../../shared/utils/form-errors';
import { Role } from '../../../../../../../shared/models/enums';
import { AdminUsersService } from '../../../../../services/admin-users.service';
import { LoaderService } from '../../../../../../../shared/services/loader.service';
import { ToastService } from '../../../../../../../shared/services/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-edit-tab',
  imports: [ReactiveFormsModule],
  templateUrl: './user-edit-tab.component.html',
  styleUrl: './user-edit-tab.component.scss',
})
export class UserEditTabComponent implements OnInit {
  user = input<UserResponseDTO>();

  userUpdated = output<UserResponseDTO>();

  submitted = signal(false);
  availableRoles = Object.values(Role);

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
        .pipe(finalize(() => this.loader.hide()))
        .subscribe({
          next: (response) => {
            if (response.data) {
              this.userUpdated.emit(response.data);
            }
            this.toast.success('Usuario actualizado correctamente.');
            this.submitted.set(false);
          },
        });
    }
  }

  labels = {
    firstName: 'El nombre',
    lastName: 'El apellido',
    nickName: 'El nombre de usuario',
    email: 'El correo',
    roles: 'Los roles',
  };

  getError(field: string): string | null {
    return getFieldError(this.profileForm, field, this.submitted(), this.labels);
  }
}
