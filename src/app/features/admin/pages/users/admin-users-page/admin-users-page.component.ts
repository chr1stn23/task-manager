import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminUsersService } from '../../../services/admin-users.service';
import { UserListResponseDTO } from '../../../../../shared/models/response/user-response.model';
import { Page } from '../../../../../shared/models/page.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../../shared/services/toast.service';
import { LoaderService } from '../../../../../shared/services/loader.service';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { AdminUserFiltersComponent } from './components/admin-user-filters/admin-user-filters.component';
import { AdminUserTableComponent } from './components/admin-user-table/admin-user-table.component';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminUserFiltersComponent,
    PaginationComponent,
    AdminUserTableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './admin-users-page.component.html',
  styleUrl: './admin-users-page.component.scss',
})
export class AdminUsersPageComponent implements OnInit {
  private adminUsersService = inject(AdminUsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);
  public loader = inject(LoaderService);

  pageData = signal<Page<UserListResponseDTO> | null>(null);

  users = computed(() => this.pageData()?.content ?? []);
  totalPages = computed(() => this.pageData()?.totalPages ?? 0);
  totalElements = computed(() => this.pageData()?.totalElements ?? 0);
  hasNext = computed(() => this.pageData()?.hasNext ?? false);
  hasPrevious = computed(() => this.pageData()?.hasPrevious ?? false);

  isLoading = signal(false);
  private loadingTimeout: ReturnType<typeof setTimeout> | undefined;

  pageSize = signal(10);
  currentPage = signal(0);

  showDisabled = signal(false);
  searchUserTerm = signal('');
  searchEmailTerm = signal('');

  sort = signal<string[]>([]);

  private searchUserTimeout?: ReturnType<typeof setTimeout>;
  private searchEmailTimeout?: ReturnType<typeof setTimeout>;

  private readonly VALID_SORT_FIELDS = ['firstName', 'lastName', 'nickName', 'email'];
  private readonly VALID_SORT_DIRECTIONS = ['asc', 'desc'];

  showConfirm = signal(false);
  userToToggle = signal<UserListResponseDTO | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.searchUserTerm.set(params['search'] ?? '');
      this.searchEmailTerm.set(params['email'] ?? '');
      this.showDisabled.set(params['disabled'] === 'true');

      this.currentPage.set(params['page'] ? Number(params['page']) - 1 : 0);
      this.pageSize.set(params['size'] ? Number(params['size']) : 10);

      const sortParam = params['sort'];
      if (sortParam) {
        const sortArray = Array.isArray(sortParam) ? sortParam : [sortParam];
        const validatedSort = this.validateSortParams(sortArray);
        this.sort.set(validatedSort);
      } else {
        this.sort.set([]);
      }

      this.loadUsers();
    });
  }

  loadUsers() {
    this.loadingTimeout = setTimeout(() => {
      this.isLoading.set(true);
    }, 300);

    this.adminUsersService
      .getUsers({
        page: this.currentPage(),
        size: this.pageSize(),
        sort: this.sort(),
        name: this.searchUserTerm() || undefined,
        email: this.searchEmailTerm() || undefined,
        enabled: this.showDisabled() ? false : undefined,
      })
      .subscribe({
        next: (res) => {
          clearTimeout(this.loadingTimeout);
          this.isLoading.set(false);

          this.pageData.set(res.data ?? null);
        },
        error: () => {
          clearTimeout(this.loadingTimeout);
          this.isLoading.set(false);
        },
      });
  }

  private updateUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage() > 0 ? this.currentPage() + 1 : null,
        size: this.pageSize() !== 10 ? this.pageSize() : null,
        search: this.searchUserTerm() || null,
        email: this.searchEmailTerm() || null,
        disabled: this.showDisabled() ? true : null,
        sort: this.sort(),
      },
      queryParamsHandling: 'merge',
    });
  }

  onSearchUser(term: string) {
    clearTimeout(this.searchUserTimeout);

    this.searchUserTimeout = setTimeout(() => {
      this.searchUserTerm.set(term);
      this.currentPage.set(0);
      this.updateUrl();
    }, 400);
  }

  onSearchEmail(term: string) {
    clearTimeout(this.searchEmailTimeout);

    this.searchEmailTimeout = setTimeout(() => {
      this.searchEmailTerm.set(term);
      this.currentPage.set(0);
      this.updateUrl();
    }, 400);
  }

  toggleDisabled(value: boolean) {
    this.showDisabled.set(value);
    this.currentPage.set(0);
    this.updateUrl();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.updateUrl();
  }

  onSort(column: string) {
    let currentSortList = [...this.sort()];

    const index = currentSortList.findIndex((s) => s.startsWith(`${column},`));

    if (index !== -1) {
      const [_, direction] = currentSortList[index].split(',');

      if (direction === 'asc') {
        currentSortList[index] = `${column},desc`;
      } else {
        currentSortList.splice(index, 1);
      }
    } else {
      currentSortList.push(`${column},asc`);
    }

    if (currentSortList.length === 0) {
      currentSortList = [];
    }

    this.sort.set(currentSortList);
    this.currentPage.set(0);
    this.updateUrl();
  }

  changePage(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.updateUrl();
  }

  resetFilters() {
    this.searchUserTerm.set('');
    this.searchEmailTerm.set('');
    this.showDisabled.set(false);
    this.currentPage.set(0);
    this.pageSize.set(10);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  //----------------------

  onUserDetail(userId: number) {
    this.router.navigate([userId], {
      relativeTo: this.route,
    });
  }

  onToggleStatus(user: UserListResponseDTO) {
    this.userToToggle.set(user);
    this.showConfirm.set(true);
  }

  confirmToggle() {
    const user = this.userToToggle();
    if (!user) return;

    const isDisabling = user.enabled;

    const action$ = isDisabling
      ? this.adminUsersService.disableUser(user.id)
      : this.adminUsersService.enableUser(user.id);

    const successMessage = isDisabling
      ? 'Usuario desactivado correctamente'
      : 'Usuario activado correctamente';

    this.loader.show();

    action$.subscribe({
      next: () => {
        this.loader.hide();
        this.toast.success(successMessage);

        const updated = this.users().map((u) =>
          u.id === user.id ? { ...u, enabled: !u.enabled } : u,
        );

        this.pageData.update((p) => (p ? { ...p, content: updated } : p));

        this.closeConfirm();
      },
      error: () => {
        this.loader.hide();
        this.closeConfirm();
      },
    });
  }

  closeConfirm() {
    this.userToToggle.set(null);
    this.showConfirm.set(false);
  }

  //-----------------------
  private validateSortParams(sortArray: string[]): string[] {
    const validatedSort = sortArray.filter((sort) => {
      const [field, direction] = sort.split(',');
      return (
        this.VALID_SORT_FIELDS.includes(field) && this.VALID_SORT_DIRECTIONS.includes(direction)
      );
    });

    return validatedSort.length > 0 ? validatedSort : [];
  }
}
