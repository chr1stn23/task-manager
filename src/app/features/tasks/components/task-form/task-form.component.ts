import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { TaskRequestDTO } from '../../../../shared/models/request/task-request.model';
import { CommonModule } from '@angular/common';
import { getFieldError } from '../../../../shared/utils/form-errors';
import { TaskResponseDTO } from '../../../../shared/models/response/task-response.model';

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

  @Input() taskToEdit?: TaskResponseDTO;
  @Output() taskUpdated = new EventEmitter<void>();
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
    description: this.fb.control<string | null>(null, { validators: [Validators.maxLength(500)] }),
    priority: this.fb.control('LOW', { validators: [Validators.required], nonNullable: true }),
    status: this.fb.control('TODO', { validators: [Validators.required], nonNullable: true }),
    dueDate: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
    if (this.taskToEdit) {
      this.taskForm.patchValue({
        title: this.taskToEdit.title,
        description: this.taskToEdit.description,
        priority: this.taskToEdit.priority,
        status: this.taskToEdit.status,
        dueDate: this.taskToEdit.dueDate ? this.taskToEdit.dueDate.substring(0, 10) : null,
      });
    }
  }

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

    const request$ = this.taskToEdit
      ? this.taskService.updateTask(this.taskToEdit.id, taskRequest)
      : this.taskService.createTask(taskRequest);

    request$.subscribe({
      next: (req) => {
        if (req.success) {
          this.taskToEdit ? this.taskUpdated.emit() : this.taskCreated.emit();
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
