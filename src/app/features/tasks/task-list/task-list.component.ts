import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TaskService } from '../services/task.service';
import { TaskResponseDTO } from '../../../shared/models/response/task-response.model';
import { Priority, TaskStatus } from '../../../shared/models/enums';

import { TaskFormComponent } from '../components/task-form/task-form.component';
import { TaskCardComponent } from '../components/task-card/task-card.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { TaskFiltersComponent } from '../components/task-filters/task-filters.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

import { ToastService } from '../../../shared/services/toast.service';
import { LoaderService } from '../../../shared/services/loader.service';

import { Page } from '../../../shared/models/page.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    TaskFormComponent,
    TaskCardComponent,
    ConfirmModalComponent,
    TaskFiltersComponent,
    PaginationComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private toast = inject(ToastService);
  public loader = inject(LoaderService);

  pageData = signal<Page<TaskResponseDTO> | null>(null);

  tasks = computed(() => this.pageData()?.content ?? []);
  totalPages = computed(() => this.pageData()?.totalPages ?? 0);
  totalElements = computed(() => this.pageData()?.totalElements ?? 0);
  hasNext = computed(() => this.pageData()?.hasNext ?? false);
  hasPrevious = computed(() => this.pageData()?.hasPrevious ?? false);

  isLoading = signal(false);
  private loadingTimeout: ReturnType<typeof setTimeout> | undefined;

  pageSize = signal(6);
  currentPage = signal(0);

  showDeleted = signal(false);
  searchTerm = signal('');
  selectedStatus = signal<TaskStatus | undefined>(undefined);
  selectedPriority = signal<Priority | undefined>(undefined);

  showModal = signal(false);
  selectedTask = signal<TaskResponseDTO | undefined>(undefined);

  showDeleteConfirm = signal(false);
  taskIdToDelete = signal<number | null>(null);

  ngOnInit() {
    const params = this.route.snapshot.queryParams;

    if (params['status']) this.selectedStatus.set(params['status']);
    if (params['priority']) this.selectedPriority.set(params['priority']);
    if (params['deleted']) this.showDeleted.set(params['deleted'] === 'true');
    if (params['search']) this.searchTerm.set(params['search']);
    if (params['page']) this.currentPage.set(Number(params['page']) - 1);
    if (params['size']) this.pageSize.set(Number(params['size']));

    this.loadTasks();
  }

  loadTasks() {
    this.loadingTimeout = setTimeout(() => {
      this.isLoading.set(true);
    }, 300);

    this.taskService
      .getTasks(
        this.showDeleted(),
        this.searchTerm(),
        this.selectedStatus(),
        this.selectedPriority(),
        this.currentPage(),
        this.pageSize(),
      )
      .subscribe({
        next: (res) => {
          clearTimeout(this.loadingTimeout);
          this.isLoading.set(false);

          if (!res.success || !res.data) return;

          this.pageData.set(res.data);
        },
        error: () => {
          clearTimeout(this.loadingTimeout);
          this.isLoading.set(false);
          this.toast.error('Error al cargar las tareas');
        },
      });
  }

  changePage(newPage: number) {
    this.currentPage.set(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.updateUrlAndLoad();
  }

  // =========================
  // FILTERS
  // =========================
  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.updateUrlAndLoad();
  }

  onFilterStatus(status: TaskStatus | undefined) {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.updateUrlAndLoad();
  }

  onFilterPriority(priority: Priority | undefined) {
    this.selectedPriority.set(priority);
    this.currentPage.set(0);
    this.updateUrlAndLoad();
  }

  toggleView(viewDeleted: boolean) {
    if (this.showDeleted() === viewDeleted) return;

    this.showDeleted.set(viewDeleted);
    this.currentPage.set(0);
    this.updateUrlAndLoad();
  }

  onSearch(query: string) {
    this.searchTerm.set(query);
    this.currentPage.set(0);
    this.updateUrlAndLoad();
  }

  resetFilters() {
    this.selectedStatus.set(undefined);
    this.selectedPriority.set(undefined);
    this.showDeleted.set(false);
    this.searchTerm.set('');
    this.currentPage.set(0);
    this.pageSize.set(6);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });

    this.loadTasks();
  }

  // =========================
  // URL SYNC
  // =========================
  private updateUrlAndLoad() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.selectedStatus() || null,
        priority: this.selectedPriority() || null,
        deleted: this.showDeleted() ? true : null,
        search: this.searchTerm() || null,
        page: this.currentPage() > 0 ? this.currentPage() + 1 : null,
        size: this.pageSize() !== 6 ? this.pageSize() : null,
      },
      queryParamsHandling: 'merge',
    });

    this.loadTasks();
  }

  // =========================
  // TASK ACTIONS
  // =========================
  editTask(task: TaskResponseDTO) {
    this.selectedTask.set(task);
    this.showModal.set(true);
  }

  openModal() {
    this.selectedTask.set(undefined);
    this.showModal.set(true);
  }

  closeModal() {
    this.selectedTask.set(undefined);
    this.showModal.set(false);
  }

  deleteTask(id: number) {
    this.taskIdToDelete.set(id);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    const id = this.taskIdToDelete();
    if (!id) return;

    this.loader.show();

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.loader.hide();
        this.toast.success('Tarea eliminada con éxito');

        if (this.tasks().length === 1 && this.currentPage() > 0) {
          this.currentPage.update((p) => p - 1);
        }

        this.updateUrlAndLoad();
        this.closeConfirm();
      },
      error: () => {
        this.loader.hide();
        this.closeConfirm();
      },
    });
  }

  closeConfirm() {
    this.taskIdToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }
}
