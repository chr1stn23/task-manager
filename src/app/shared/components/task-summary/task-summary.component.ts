import { Component, inject, input, OnInit, signal } from '@angular/core';
import { TaskService } from '../../../features/tasks/services/task.service';
import {
  ChartColumn,
  CircleCheckBig,
  Clock,
  ListTodo,
  LucideAngularModule,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  Zap,
} from 'lucide-angular';
import { TaskSummaryDTO } from '../../models/response/task-response.model';
import { finalize } from 'rxjs';
import { AdminTasksService } from '../../../features/admin/services/admin-tasks.service';

@Component({
  selector: 'app-task-summary',
  imports: [LucideAngularModule],
  templateUrl: './task-summary.component.html',
  styleUrl: './task-summary.component.scss',
})
export class TaskSummaryComponent implements OnInit {
  private taskService = inject(TaskService);
  private adminTasksService = inject(AdminTasksService);
  userId = input<number | undefined>();

  readonly icons = {
    total: ListTodo,
    todo: Clock,
    inProgress: ChartColumn,
    done: CircleCheckBig,
    high: ShieldAlert,
    medium: Zap,
    low: TriangleAlert,
    deleted: Trash2,
  };

  summary = signal<TaskSummaryDTO | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    const id = this.userId();
    this.isLoading.set(true);

    const summary$ = id
      ? this.adminTasksService.getTaskUserSummary(id)
      : this.taskService.getMyTaskSummary();

    summary$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.summary.set(res.data);
        }
      },
    });
  }
}
