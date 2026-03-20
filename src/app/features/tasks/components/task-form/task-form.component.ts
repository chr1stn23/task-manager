import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { TaskRequestDTO } from '../../../../shared/models/request/task-request.model';
import { CommonModule } from '@angular/common';
import { getFieldError } from '../../../../shared/utils/form-errors';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);

  @Output() taskCreated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  submitted = signal(false);

  taskForm = this.fb.group({
    title: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
    description: [''],
    priority: this.fb.control('LOW', { validators: [Validators.required], nonNullable: true }),
    status: this.fb.control('TODO', { validators: [Validators.required], nonNullable: true }),
    dueDate: [null],
  });

  onSubmit() {
    this.submitted.set(true);
    if (this.taskForm.invalid) return;

    this.isLoading.set(true);
    const rawValue = this.taskForm.getRawValue();
    const taskRequest: TaskRequestDTO = {
      title: rawValue.title,
      priority: rawValue.priority as any,
      status: rawValue.status as any,
      description: rawValue.description || undefined,
      dueDate: rawValue.dueDate ? new Date(rawValue.dueDate).toISOString() : undefined,
    };

    this.taskService.createTask(taskRequest).subscribe({
      next: (req) => {
        if (req.success) {
          this.taskCreated.emit();
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

  labels = {
    title: 'El título',
  };

  getError(field: string): string | null {
    return getFieldError(this.taskForm, field, this.submitted(), this.labels);
  }
}
