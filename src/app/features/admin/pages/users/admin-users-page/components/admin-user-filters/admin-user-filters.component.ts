import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-admin-user-filters',
  standalone: true,
  templateUrl: './admin-user-filters.component.html',
  styleUrl: './admin-user-filters.component.scss',
})
export class AdminUserFiltersComponent {
  searchUserTerm = input<string>('');
  searchEmailTerm = input<string>('');
  showDisabledUsers = input<boolean>(false);
  pageSize = input<number>(10);

  searchUserChange = output<string>();
  searchEmailChange = output<string>();
  reset = output<void>();
  toggleDisabled = output<boolean>();
  pageSizeChange = output<number>();

  onUserInput(value: string) {
    this.searchUserChange.emit(value);
  }

  onEmailInput(value: string) {
    this.searchEmailChange.emit(value);
  }

  onPageSizeChange(value: string) {
    this.pageSizeChange.emit(Number(value));
  }
}
