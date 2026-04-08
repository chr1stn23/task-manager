import { Component, input } from '@angular/core';
import { UserSessionsComponent } from '../../../../../../../shared/components/user-sessions/user-sessions.component';

@Component({
  selector: 'app-user-sessions-tab',
  imports: [UserSessionsComponent],
  templateUrl: './user-sessions-tab.component.html',
  styleUrl: './user-sessions-tab.component.scss',
})
export class UserSessionsTabComponent {
  userId = input<number>();
}
