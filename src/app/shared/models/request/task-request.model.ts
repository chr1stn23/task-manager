import { Priority, TaskStatus } from '../enums';

export interface TaskRequestDTO {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO string format
}
