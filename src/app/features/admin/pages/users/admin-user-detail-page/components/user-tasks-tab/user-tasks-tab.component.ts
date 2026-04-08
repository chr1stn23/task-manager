import { Component, input } from '@angular/core';
import { TaskSummaryComponent } from '../../../../../../../shared/components/task-summary/task-summary.component';

@Component({
  selector: 'app-user-tasks-tab',
  imports: [TaskSummaryComponent],
  templateUrl: './user-tasks-tab.component.html',
  styleUrl: './user-tasks-tab.component.scss',
})
export class UserTasksTabComponent {
  userId = input<number>();
}
