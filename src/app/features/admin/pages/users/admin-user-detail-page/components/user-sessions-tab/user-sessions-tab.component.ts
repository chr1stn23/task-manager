import { Component, input } from '@angular/core';

@Component({
  selector: 'app-user-sessions-tab',
  imports: [],
  templateUrl: './user-sessions-tab.component.html',
  styleUrl: './user-sessions-tab.component.scss',
})
export class UserSessionsTabComponent {
  userId = input<number>();
}
