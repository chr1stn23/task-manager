import { Component, input, output } from '@angular/core';
import { Priority, TaskStatus } from '../../../../shared/models/enums';

@Component({
  selector: 'app-task-filters',
  imports: [],
  templateUrl: './task-filters.component.html',
  styleUrl: './task-filters.component.scss',
})
export class TaskFiltersComponent {
  selectedStatus = input<TaskStatus | undefined>(undefined);
  selectedPriority = input<Priority | undefined>(undefined);
  pageSize = input<number>(10);
  showDeleted = input<boolean>(false);

  statusChange = output<Event>();
  priorityChange = output<Event>();
  pageSizeChange = output<Event>();
  reset = output<void>();
  viewToggled = output<boolean>();
}
