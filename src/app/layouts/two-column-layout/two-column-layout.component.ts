import { Component } from '@angular/core';
import { ProfileSidebarComponent } from '../../features/profile/components/profile-sidebar/profile-sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-two-column-layout',
  imports: [ProfileSidebarComponent, RouterOutlet],
  templateUrl: './two-column-layout.component.html',
  styleUrl: './two-column-layout.component.scss',
})
export class TwoColumnLayoutComponent {}
