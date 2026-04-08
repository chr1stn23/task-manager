import { Component, input } from '@angular/core';
import { UserResponseDTO } from '../../../../../../../shared/models/response/user-response.model';

@Component({
  selector: 'app-user-edit-tab',
  imports: [],
  templateUrl: './user-edit-tab.component.html',
  styleUrl: './user-edit-tab.component.scss',
})
export class UserEditTabComponent {
  user = input<UserResponseDTO>();
}
