import { Priority, TaskStatus } from '../enums';

export interface AdminDashboardDTO {
  activeUsers: number;
  totalTasks: number;
  liveSessions: number;
  tasksByStatus: StatusCountDTO[];
  tasksByPriority: PriorityCountDTO[];
  topUsers: UserTaskCountDTO[];
}

export interface StatusCountDTO {
  status: TaskStatus;
  count: number;
}

export interface PriorityCountDTO {
  priority: Priority;
  count: number;
}

export interface UserTaskCountDTO {
  nickName: string;
  taskCount: number;
}
