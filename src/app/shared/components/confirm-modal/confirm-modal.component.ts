import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { CircleCheckBig, LucideAngularModule, ShieldAlert, TriangleAlert } from 'lucide-angular';

@Component({
  selector: 'app-confirm-modal',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  variant = input<'danger' | 'success' | 'warning'>('warning');

  readonly icons = {
    danger: TriangleAlert,
    warning: ShieldAlert,
    success: CircleCheckBig,
  };

  get currentIcon() {
    return this.icons[this.variant()];
  }

  modalTitle = input<string>('¿Estás seguro?');
  message = input<string>('Esta acción no se puede revertir.');
  confirmText = input<string>('Confirmar');
  confirm = output<void>();
  cancel = output<void>();
}
