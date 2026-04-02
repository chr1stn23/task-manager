import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { getFieldError } from '../../../../shared/utils/form-errors';
import { UserResponseDTO } from '../../../../shared/models/response/user-response.model';

import { of, switchMap, map, finalize } from 'rxjs';
import { LoaderService } from '../../../../shared/services/loader.service';

@Component({
  selector: 'app-profile-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  private userService = inject(UserService);

  private toast = inject(ToastService);
  loader = inject(LoaderService);

  submitted = signal(false);

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
    nickName: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();

    if (user) {
      this.profileForm.patchValue(user);
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.profileForm.invalid || this.loader.isLoading()) return;
    this.loader.show();

    const formValue = {
      ...this.profileForm.value,
      lastName: this.profileForm.value.lastName?.trim() || null,
    };

    const file = this.selectedFile();

    this.userService
      .updateCurrentUser(formValue)
      .pipe(
        switchMap((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message || 'Error al actualizar el perfil');
          }

          const user = response.data;

          if (!file) {
            return of(user);
          }

          return this.userService.uploadProfilePicture(file).pipe(
            map((imgRes) => {
              if (imgRes.success && imgRes.data) {
                return {
                  ...user,
                  profileImageUrl: imgRes.data,
                };
              }

              this.toast.warning('Perfil actualizado, pero la imagen falló');
              return user;
            }),
          );
        }),
        finalize(() => {
          this.loader.hide();
        }),
      )
      .subscribe((result: UserResponseDTO | null) => {
        if (!result) return;
        const current = this.authService.currentUser();

        if (current) {
          this.authService.currentUser.set({
            ...current,
            ...result,
            profileImageUrl: result.profileImageUrl ?? current.profileImageUrl,
          });
        }
        this.selectedFile.set(null);
        this.previewUrl.set(null);

        this.toast.success('Perfil actualizado con éxito');
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  labels = {
    firstName: 'El nombre',
    lastName: 'El apellido',
    nickName: 'El nombre de usuario',
    email: 'El correo',
  };

  getError(field: string): string | null {
    return getFieldError(this.profileForm, field, this.submitted(), this.labels);
  }
}
