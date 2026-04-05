import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SidebarItem } from '../../models/sidebar-item.model';

@Component({
  selector: 'app-sidebar',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly items = input<SidebarItem[]>([]);
}
