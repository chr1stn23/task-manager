import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../../tasks/services/task.service';
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
import { TaskSummaryDTO } from '../../../../shared/models/response/task-response.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-task-summary',
  imports: [LucideAngularModule],
  templateUrl: './task-summary.component.html',
  styleUrl: './task-summary.component.scss',
})
export class TaskSummaryComponent implements OnInit {
  private taskService = inject(TaskService);

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
    this.isLoading.set(true);
    this.taskService
      .getMyTaskSummary()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.summary.set(res.data);
          }
        },
      });
  }
}
