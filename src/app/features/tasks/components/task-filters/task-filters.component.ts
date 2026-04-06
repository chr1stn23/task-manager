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
  searchTerm = input<string>('');

  statusChange = output<TaskStatus | undefined>();
  priorityChange = output<Priority | undefined>();
  pageSizeChange = output<number>();
  searchTermChange = output<string>();
  reset = output<void>();
  viewToggled = output<boolean>();

  onSearchInput(value: string) {
    this.searchTermChange.emit(value);
  }

  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as TaskStatus;
    this.statusChange.emit(value || undefined);
  }

  onPriorityChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as Priority;
    this.priorityChange.emit(value || undefined);
  }

  onPageSizeChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
  }
}
