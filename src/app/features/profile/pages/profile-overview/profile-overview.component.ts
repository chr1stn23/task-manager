import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { TaskSummaryComponent } from '../../components/task-summary/task-summary.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, TaskSummaryComponent, AvatarComponent],
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.scss',
})
export class ProfileOverviewComponent {
  public authService = inject(AuthService);

  user = this.authService.currentUser;
}
