import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.service';
import { TaskResponseDTO } from '../../../shared/models/response/task-response.model';
import { Priority, TaskStatus } from '../../../shared/models/enums';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);

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
    this.resetPaginationAndLoad();
  }

  onFilterStatus(event: Event) {
    const value = (event.target as HTMLSelectElement).value as TaskStatus;
    this.selectedStatus.set(value || undefined);
    this.resetPaginationAndLoad();
  }

  onFilterPriority(event: Event) {
    const value = (event.target as HTMLSelectElement).value as Priority;
    this.selectedPriority.set(value || undefined);
    this.resetPaginationAndLoad();
  }

  onFilterDeleted(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.showDeleted.set(isChecked);
    this.resetPaginationAndLoad();
  }

  changePage(newPage: number) {
    this.currentPage.set(newPage);
    this.loadTasks();
  }

  private resetPaginationAndLoad() {
    this.currentPage.set(0);
    this.loadTasks();
  }

  deleteTask(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta tarea?')) {
      this.taskService.deleteTask(id).subscribe(() => this.loadTasks());
    }
  }
}
