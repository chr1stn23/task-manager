import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.service';
import { TaskResponseDTO } from '../../../shared/models/response/task-response.model';
import { Priority, TaskStatus } from '../../../shared/models/enums';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tasks = signal<TaskResponseDTO[]>([]);
  isLoading = signal<boolean>(false);

  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  showDeleted = signal<boolean>(false);
  selectedStatus = signal<TaskStatus | undefined>(undefined);
  selectedPriority = signal<Priority | undefined>(undefined);

  readonly statusLabels: Record<string, string> = {
    TODO: 'Pendiente',
    IN_PROGRESS: 'En Progreso',
    DONE: 'Completada',
  };

  readonly priorityLabels: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
  };

  ngOnInit() {
    const params = this.route.snapshot.queryParams;

    if (params['status']) this.selectedStatus.set(params['status']);
    if (params['priority']) this.selectedPriority.set(params['priority']);
    if (params['deleted']) this.showDeleted.set(params['deleted'] === 'true');
    if (params['page']) this.currentPage.set(Number(params['page']));
    if (params['size']) this.pageSize.set(Number(params['size']));

    this.loadTasks();
  }

  private updateUrlAndLoad() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.selectedStatus() || null,
        priority: this.selectedPriority() || null,
        deleted: this.showDeleted() ? true : null,
        page: this.currentPage() > 0 ? this.currentPage() : null,
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
          if (res.success) {
            this.tasks.set(res.data.content);
            this.totalElements.set(res.data.page.totalElements);
            this.totalPages.set(res.data.page.totalPages);
          }
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  onPageSizeChange(event: Event) {
    const newSize = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(newSize);
    this.currentPage.set(0);
    this.updateUrlAndLoad();
  }

  onFilterStatus(event: Event) {
    const value = (event.target as HTMLSelectElement).value as TaskStatus;
    this.selectedStatus.set(value || undefined);
    this.currentPage.set(0);
    this.updateUrlAndLoad();
  }

  onFilterPriority(event: Event) {
    const value = (event.target as HTMLSelectElement).value as Priority;
    this.selectedPriority.set(value || undefined);
    this.currentPage.set(0);
    this.updateUrlAndLoad();
  }

  onFilterDeleted(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.showDeleted.set(isChecked);
    this.currentPage.set(0);
    this.updateUrlAndLoad();
  }

  changePage(newPage: number) {
    this.currentPage.set(newPage);
    this.updateUrlAndLoad();
  }

  deleteTask(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta tarea?')) {
      this.taskService.deleteTask(id).subscribe(() => this.loadTasks());
    }
  }

  resetFilters() {
    this.selectedStatus.set(undefined);
    this.selectedPriority.set(undefined);
    this.showDeleted.set(false);
    this.currentPage.set(0);
    this.pageSize.set(10);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });

    this.loadTasks();
  }
}
