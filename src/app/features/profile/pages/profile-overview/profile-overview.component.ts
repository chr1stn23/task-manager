import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProfileSessionsComponent } from '../../components/profile-sessions/profile-sessions.component';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, ProfileSessionsComponent],
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.scss',
})
export class ProfileOverviewComponent {
  public authService = inject(AuthService);

  user = this.authService.currentUser;
}
