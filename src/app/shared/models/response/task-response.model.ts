import { Priority, TaskStatus } from '../enums';

export interface TaskResponseDTO {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string; // ISO string format
}
