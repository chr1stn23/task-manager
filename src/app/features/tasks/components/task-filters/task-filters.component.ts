import { Component, input, OnDestroy, OnInit, output } from '@angular/core';
import { Priority, TaskStatus } from '../../../../shared/models/enums';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-task-filters',
  imports: [],
  templateUrl: './task-filters.component.html',
  styleUrl: './task-filters.component.scss',
})
export class TaskFiltersComponent implements OnInit, OnDestroy {
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

  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((value) => {
      this.searchTermChange.emit(value);
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchKeyup(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
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
