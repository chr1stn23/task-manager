import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../services/task.service';
import { TaskResponseDTO } from '../../../shared/models/response/task-response.model';
import { Priority, TaskStatus } from '../../../shared/models/enums';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskFormComponent } from '../components/task-form/task-form.component';
import { TaskCardComponent } from '../components/task-card/task-card.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { TaskFiltersComponent } from '../components/task-filters/task-filters.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskFormComponent, TaskCardComponent, ConfirmModalComponent, TaskFiltersComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tasks = signal<TaskResponseDTO[]>([]);
  isLoading = signal<boolean>(false);

  pageSize = signal<number>(6);
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  showDeleted = signal<boolean>(false);
  selectedStatus = signal<TaskStatus | undefined>(undefined);
  selectedPriority = signal<Priority | undefined>(undefined);

  showModal = signal<boolean>(false);
  selectedTask = signal<TaskResponseDTO | undefined>(undefined);

  showConfirm = signal<boolean>(false);
  taskIdToDelete = signal<number | null>(null);

  ngOnInit() {
    const params = this.route.snapshot.queryParams;

    if (params['status']) this.selectedStatus.set(params['status']);
    if (params['priority']) this.selectedPriority.set(params['priority']);
    if (params['deleted']) this.showDeleted.set(params['deleted'] === 'true');
    if (params['page']) this.currentPage.set(Number(params['page']) - 1);
    if (params['size']) this.pageSize.set(Number(params['size']));

    this.loadTasks();
  }

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

  private updateUrlAndLoad() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.selectedStatus() || null,
        priority: this.selectedPriority() || null,
        deleted: this.showDeleted() ? true : null,
        page: this.currentPage() > 0 ? this.currentPage() + 1 : null,
        size: this.pageSize() !== 10 ? this.pageSize() : null,
      },
      queryParamsHandling: 'merge',
    });

    this.loadTasks();
  }

  loadTasks() {
    this.isLoading.set(true);
    this.taskService
      .getTasks(
        this.showDeleted(),
        this.selectedStatus(),
        this.selectedPriority(),
        this.currentPage(),
        this.pageSize(),
      )
      .subscribe({
        next: (res) => {
          if (!res.success || !res.data) {
            this.isLoading.set(false);
            return;
          }

          this.tasks.set(res.data.content);
          this.totalElements.set(res.data.page.totalElements);
          this.totalPages.set(res.data.page.totalPages);

          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

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

  changePage(newPage: number) {
    this.currentPage.set(newPage);
    this.updateUrlAndLoad();
  }

  resetFilters() {
    this.selectedStatus.set(undefined);
    this.selectedPriority.set(undefined);
    this.showDeleted.set(false);
    this.currentPage.set(0);
    this.pageSize.set(6);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });

    this.loadTasks();
  }

  deleteTask(id: number) {
    this.taskIdToDelete.set(id);
    this.showConfirm.set(true);
  }

  confirmDelete() {
    const id = this.taskIdToDelete();
    if (id) {
      this.taskService.deleteTask(id).subscribe(() => {
        if (this.tasks().length === 1 && this.currentPage() > 0) {
          this.currentPage.update((p) => p - 1);
        }

        this.updateUrlAndLoad();
        this.closeConfirm();
      });
    }
  }

  closeConfirm() {
    this.taskIdToDelete.set(null);
    this.showConfirm.set(false);
  }
}
