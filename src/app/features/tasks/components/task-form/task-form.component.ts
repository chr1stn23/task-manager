import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { TaskRequestDTO } from '../../../../shared/models/request/task-request.model';
import { CommonModule } from '@angular/common';
import { getFieldError } from '../../../../shared/utils/form-errors';
import { TaskResponseDTO } from '../../../../shared/models/response/task-response.model';
import { Priority, TaskStatus } from '../../../../shared/models/enums';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);

  taskToEdit = input<TaskResponseDTO | undefined>(undefined);
  isReadOnly = input<boolean>(false);
  taskUpdated = output<void>();
  taskCreated = output<void>();
  taskRestored = output<void>();
  close = output<void>();

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  submitted = signal(false);

  taskForm = this.fb.group({
    title: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
    description: this.fb.control<string | null>(null, { validators: [Validators.maxLength(500)] }),
    priority: this.fb.control('LOW', { validators: [Validators.required], nonNullable: true }),
    status: this.fb.control('TODO', { validators: [Validators.required], nonNullable: true }),
    dueDate: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
    const task = this.taskToEdit();
    if (task) {
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : null,
      });

      if (this.isReadOnly()) {
        this.taskForm.disable();
      }
    }
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.taskForm.invalid) return;

    this.isLoading.set(true);
    const rawValue = this.taskForm.getRawValue();
    const taskRequest: TaskRequestDTO = {
      title: rawValue.title,
      priority: rawValue.priority as Priority,
      status: rawValue.status as TaskStatus,
      description: rawValue.description || undefined,
      dueDate: rawValue.dueDate ? new Date(rawValue.dueDate).toISOString() : undefined,
    };

    const task = this.taskToEdit();
    const request$ = task
      ? this.taskService.updateTask(task.id, taskRequest)
      : this.taskService.createTask(taskRequest);

    request$.subscribe({
      next: (req) => {
        if (req.success) {
          if (task) {
            this.taskUpdated.emit();
          } else {
            this.taskCreated.emit();
          }
          this.close.emit();
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error?.message || 'Error al crear la tarea');
        this.isLoading.set(false);
      },
    });
  }

  onRestore() {
    const task = this.taskToEdit();
    if (!task) return;

    this.taskService.restoreTask(task.id).subscribe({
      next: (req) => {
        if (req.success) {
          this.taskRestored.emit();
          this.close.emit();
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error?.message || 'Error al restaurar la tarea');
        this.isLoading.set(false);
      },
    });
  }

  labels = {
    title: 'El título',
  };

  getError(field: string): string | null {
    return getFieldError(this.taskForm, field, this.submitted(), this.labels);
  }
}
