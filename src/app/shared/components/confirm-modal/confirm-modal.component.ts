import { Component, input, output } from '@angular/core';
import { LucideAngularModule, TriangleAlert } from 'lucide-angular';

@Component({
  selector: 'app-confirm-modal',
  imports: [LucideAngularModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  readonly TriangleAlert = TriangleAlert;

  title = input<string>('¿Estás seguro?');
  message = input<string>('Esta acción no se puede revertir.');
  confirm = output<void>();
  cancel = output<void>();
}
