import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { SIDEBARS } from '../../shared/config/sidebars.config';
import { SidebarItem } from '../../shared/models/sidebar-item.model';

@Component({
  selector: 'app-two-column-layout',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './two-column-layout.component.html',
  styleUrl: './two-column-layout.component.scss',
})
export class TwoColumnLayoutComponent implements OnInit {
  items: SidebarItem[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const key = this.route.snapshot.data['sidebar'];
    this.items = SIDEBARS[key] ?? [];
  }
}
