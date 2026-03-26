import { Component } from '@angular/core';
import { ProfileSidebarComponent } from '../components/profile-sidebar/profile-sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profile-layout',
  imports: [ProfileSidebarComponent, RouterOutlet],
  templateUrl: './profile-layout.component.html',
  styleUrl: './profile-layout.component.scss',
})
export class ProfileLayoutComponent {}
