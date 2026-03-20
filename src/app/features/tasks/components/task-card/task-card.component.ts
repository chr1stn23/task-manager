import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskResponseDTO } from '../../../../shared/models/response/task-response.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  @Input({ required: true }) task!: TaskResponseDTO;
  @Output() edit = new EventEmitter<TaskResponseDTO>();
  @Output() delete = new EventEmitter<number>();

  readonly statusLabels: Record<string, string> = {
    TODO: 'Pendiente',
    IN_PROGRESS: 'En progreso',
    DONE: 'Completada',
  };

  readonly priorityLabels: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
  };

  isExpired(task: TaskResponseDTO): boolean {
    if (!task.dueDate) return false;

    if (task.status === 'DONE') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  }
}
