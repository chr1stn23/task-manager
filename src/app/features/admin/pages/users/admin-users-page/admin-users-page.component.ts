import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminUsersService } from '../../../services/admin-users.service';
import { UserListResponseDTO } from '../../../../../shared/models/response/user-response.model';
import { Page } from '../../../../../shared/models/page.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../../shared/services/toast.service';
import { LoaderService } from '../../../../../shared/services/loader.service';
import { AdminUserFiltersComponent } from '../../../components/admin-user-filters/admin-user-filters.component';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminUserFiltersComponent],
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

  sort = signal<string[]>(['firstName,asc']);

  private searchUserTimeout?: ReturnType<typeof setTimeout>;
  private searchEmailTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.searchUserTerm.set(params['search'] ?? '');
      this.searchEmailTerm.set(params['email'] ?? '');
      this.showDisabled.set(params['disabled'] === 'true');

      this.currentPage.set(params['page'] ? Number(params['page']) - 1 : 0);
      this.pageSize.set(params['size'] ? Number(params['size']) : 10);

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
}
