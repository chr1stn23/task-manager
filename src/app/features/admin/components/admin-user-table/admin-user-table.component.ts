import { Component, input, output } from '@angular/core';
import { UserListResponseDTO } from '../../../../shared/models/response/user-response.model';
import { CommonModule } from '@angular/common';
import {
  UserCheck,
  UserX,
  LucideAngularModule,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-angular';

@Component({
  selector: 'app-admin-user-table',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-user-table.component.html',
  styleUrl: './admin-user-table.component.scss',
})
export class AdminUserTableComponent {
  users = input.required<UserListResponseDTO[]>();

  currentSort = input<string[]>(['firstName,asc']);

  readonly icons = {
    detail: Eye,
    enable: UserCheck,
    disable: UserX,
    sortUp: ArrowUp,
    sortDown: ArrowDown,
    sortNone: ArrowUpDown,
  };

  userDetail = output<number>();
  toggleStatus = output<number>();
  sortChange = output<string>();

  getSortIcon(column: string) {
    const current = this.currentSort()[0];
    if (!current) return this.icons.sortNone;

    const [currentColumn, direction] = current.split(',');

    if (currentColumn === column) {
      return direction === 'asc' ? this.icons.sortUp : this.icons.sortDown;
    }

    return this.icons.sortNone;
  }

  getInitials(user: UserListResponseDTO): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
}
