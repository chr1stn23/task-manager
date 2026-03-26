import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ShieldCheck, User, UserPen } from 'lucide-angular';

@Component({
  selector: 'app-profile-sidebar',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  templateUrl: './profile-sidebar.component.html',
  styleUrl: './profile-sidebar.component.scss',
})
export class ProfileSidebarComponent {
  readonly icons = {
    overview: User,
    edit: UserPen,
    security: ShieldCheck,
  };
}
