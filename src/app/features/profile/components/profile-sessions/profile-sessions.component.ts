import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { SessionService } from '../../../../core/services/session.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { SessionResponseDTO } from '../../../../shared/models/response/session-response.model';
import {
  CircleQuestionMark,
  Laptop,
  LucideAngularModule,
  Monitor,
  Smartphone,
  TabletSmartphone,
  Terminal,
} from 'lucide-angular';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-profile-sessions',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent, LucideAngularModule],
  templateUrl: './profile-sessions.component.html',
  styleUrl: './profile-sessions.component.scss',
})
export class ProfileSessionsComponent implements OnInit {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  readonly icons = {
    windows: Monitor,
    mac: Laptop,
    smartphone: Smartphone,
    ios: TabletSmartphone,
    linux: Terminal,
    unknown: CircleQuestionMark,
  };

  sessions = signal<SessionResponseDTO[]>([]);
  isLoadingSessions = signal<boolean>(false);

  showConfirmModal = signal<boolean>(false);
  modalConfig = signal({ title: '', message: '', confirmText: '', action: () => {} });

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.isLoadingSessions.set(true);
    this.sessionService.getSessions().subscribe({
      next: (res) => {
        if (!res.success || !res.data) {
          this.isLoadingSessions.set(false);
          return;
        }
        this.sessions.set(res.data);
        this.isLoadingSessions.set(false);
      },
      error: () => this.isLoadingSessions.set(false),
    });
  }

  onRevoke(id: number) {
    this.modalConfig.set({
      title: 'Finalizar sesión',
      message: '¿Estás seguro de que quieres cerrar esta sesión?',
      confirmText: 'Cerrar Sesión',
      action: () => {
        this.sessionService.revokeSession(id).subscribe({
          next: () => {
            this.sessions.update((sessions) => sessions.filter((s) => s.id !== id));
            this.showConfirmModal.set(false);
          },
        });
      },
    });
    this.showConfirmModal.set(true);
  }

  onRevokeAll() {
    this.modalConfig.set({
      title: 'Cerrar todas las sesiones',
      message: '¿Estás seguro de que quieres cerrar todas las sesiones? Incluida la actual.',
      confirmText: 'Cerrar Todas',
      action: () => {
        this.sessionService.revokeAllSessions().subscribe({
          next: () => {
            this.showConfirmModal.set(false);
            this.toast.success('Se cerraron todas tus sesiones. Inicia sesión nuevamente.');
            this.authService.logoutAndRedirect();
          },
        });
      },
    });
    this.showConfirmModal.set(true);
  }

  getDeviceName(deviceName: string): string {
    const map: Record<string, string> = {
      'Windows PC': 'Windows PC',
      'MacBook/iMac': 'MacBook/iMac',
      'Android Device': 'Dispositivo Android',
      'iOS Device': 'Dispositivo iOS',
      'Linux Device': 'Dispositivo Linux',
      'Unknown Device': 'Dispositivo Desconocido',
    };

    return map[deviceName] || 'Dispositivo Desconocido';
  }
}
