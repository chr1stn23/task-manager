import { Priority, TaskStatus } from '../enums';

export interface TaskResponseDTO {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string; // ISO string format
}

export interface TaskSummaryDTO {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  low: number;
  medium: number;
  high: number;
  deleted: number;
}
