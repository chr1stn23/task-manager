import { Component, inject, input, output } from '@angular/core';
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
import { AuthService } from '../../../../core/auth/auth.service';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-admin-user-table',
  imports: [CommonModule, LucideAngularModule, AvatarComponent],
  templateUrl: './admin-user-table.component.html',
  styleUrl: './admin-user-table.component.scss',
})
export class AdminUserTableComponent {
  private authService = inject(AuthService);

  users = input.required<UserListResponseDTO[]>();

  currentSort = input<string[]>([]);

  readonly icons = {
    detail: Eye,
    enable: UserCheck,
    disable: UserX,
    sortUp: ArrowUp,
    sortDown: ArrowDown,
    sortNone: ArrowUpDown,
  };

  userDetail = output<number>();
  toggleStatus = output<UserListResponseDTO>();
  sortChange = output<string>();

  getSortInfo(column: string) {
    const currentList = this.currentSort();
    const index = currentList.findIndex((s) => s.startsWith(`${column},`));

    if (index === -1) {
      return { icon: this.icons.sortNone, priority: null };
    }

    const direction = currentList[index].split(',')[1];
    return {
      icon: direction === 'asc' ? this.icons.sortUp : this.icons.sortDown,
      priority: index + 1,
    };
  }

  getInitials(user: UserListResponseDTO): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  isCurrentUser(userId: number): boolean {
    return this.authService.currentUser()?.id === userId;
  }
}
