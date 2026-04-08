import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersService } from '../../../services/admin-users.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserResponseDTO } from '../../../../../shared/models/response/user-response.model';
import { finalize } from 'rxjs';
import { AvatarComponent } from '../../../../../shared/components/avatar/avatar.component';
import { ArrowLeft, LucideAngularModule, User, UserCheck, UserX } from 'lucide-angular';
import { LoaderService } from '../../../../../shared/services/loader.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { UserEditTabComponent } from './components/user-edit-tab/user-edit-tab.component';
import { UserTasksTabComponent } from './components/user-tasks-tab/user-tasks-tab.component';
import { UserSessionsTabComponent } from './components/user-sessions-tab/user-sessions-tab.component';

type UserTab = 'edit' | 'tasks' | 'sessions';

@Component({
  selector: 'app-admin-user-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
    LucideAngularModule,
    RouterLink,
    ConfirmModalComponent,
    UserEditTabComponent,
    UserTasksTabComponent,
    UserSessionsTabComponent,
  ],
  templateUrl: './admin-user-detail-page.component.html',
  styleUrl: './admin-user-detail-page.component.scss',
})
export class AdminUserDetailPageComponent implements OnInit {
  private adminUsersService = inject(AdminUsersService);
  private route = inject(ActivatedRoute);
  private loader = inject(LoaderService);
  private toast = inject(ToastService);

  readonly icons = {
    back: ArrowLeft,
    user: User,
    enable: UserCheck,
    disable: UserX,
  };

  user = signal<UserResponseDTO | undefined>(undefined);
  loading = signal<boolean>(true);

  isAdmin = computed(() => {
    const roles = this.user()?.roles || [];
    return roles.includes('ROLE_ADMIN');
  });

  showToggleStatusConfirm = signal<boolean>(false);

  activeTab = signal<UserTab>('edit');

  setTab(tab: UserTab) {
    this.activeTab.set(tab);
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadUser(Number(idParam));
    }
  }

  loadUser(id: number): void {
    this.loading.set(true);
    this.adminUsersService
      .getUserById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.data) return;
          this.user.set(response.data);
        },
      });
  }

  toggleStatus() {
    this.showToggleStatusConfirm.set(true);
  }

  confirmToggle() {
    const currentUser = this.user();
    if (!currentUser) return;

    const isDisabling = currentUser.enabled;
    this.loader.show();

    const action$ = isDisabling
      ? this.adminUsersService.disableUser(currentUser.id)
      : this.adminUsersService.enableUser(currentUser.id);

    const successMessage = isDisabling
      ? 'Usuario desactivado correctamente'
      : 'Usuario activado correctamente';

    action$
      .pipe(
        finalize(() => {
          this.loader.hide();
          this.closeConfirm();
        }),
      )
      .subscribe({
        next: () => {
          this.user.update((u) => (u ? { ...u, enabled: !u.enabled } : u));
          this.toast.success(successMessage);
        },
      });
  }

  closeConfirm() {
    this.showToggleStatusConfirm.set(false);
  }
}
