import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { SessionService } from '../../../core/services/session.service';
import { AdminSessionsService } from '../../../features/admin/services/admin-sessions.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../services/toast.service';
import { SessionResponseDTO } from '../../models/response/session-response.model';
import {
  CircleQuestionMark,
  Laptop,
  LucideAngularModule,
  Monitor,
  Smartphone,
  TabletSmartphone,
  Terminal,
} from 'lucide-angular';

@Component({
  selector: 'app-user-sessions',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent, LucideAngularModule],
  templateUrl: './user-sessions.component.html',
  styleUrl: './user-sessions.component.scss',
})
export class UserSessionsComponent implements OnInit {
  private sessionService = inject(SessionService);
  private adminSessionsService = inject(AdminSessionsService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  userId = input<number | undefined>();

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
    const targetUserId = this.userId();
    this.isLoadingSessions.set(true);

    const sessions$ = targetUserId
      ? this.adminSessionsService.getSessionsByUserId(targetUserId)
      : this.sessionService.getSessions();

    sessions$.subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.sessions.set(res.data);
        }
        this.isLoadingSessions.set(false);
      },
      error: () => this.isLoadingSessions.set(false),
    });
  }

  onRevoke(sessionId: number) {
    const targetUserId = this.userId();

    this.modalConfig.set({
      title: 'Finalizar sesión',
      message: '¿Estás seguro de que quieres cerrar esta sesión?',
      confirmText: 'Cerrar Sesión',
      action: () => {
        const revoke$ = targetUserId
          ? this.adminSessionsService.revokeSession(targetUserId, sessionId)
          : this.sessionService.revokeSession(sessionId);

        revoke$.subscribe({
          next: (res) => {
            if (res.success) {
              this.sessions.update((s) => s.filter((session) => session.id !== sessionId));
              this.toast.success('Sesión finalizada correctamente.');
            }
            this.showConfirmModal.set(false);
          },
        });
      },
    });
    this.showConfirmModal.set(true);
  }

  onRevokeAll() {
    const targetUserId = this.userId();
    this.modalConfig.set({
      title: 'Cerrar todas las sesiones',
      message: targetUserId
        ? '¿Estás seguro de cerrar todas las sesiones de este usuario?'
        : '¿Estás seguro de cerrar todas tus sesiones? Incluida la actual.',
      confirmText: 'Cerrar Todas',
      action: () => {
        const revokeAll$ = targetUserId
          ? this.adminSessionsService.revokeAllSessions(targetUserId)
          : this.sessionService.revokeAllSessions();

        revokeAll$.subscribe({
          next: (res) => {
            if (res.success) {
              this.showConfirmModal.set(false);

              if (!targetUserId) {
                this.toast.success('Se cerraron todas tus sesiones. Inicia sesión nuevamente.');
                this.authService.logoutAndRedirect();
              } else {
                this.sessions.set([]);
                this.toast.success('Todas las sesiones del usuario han sido finalizadas.');
              }
            }
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
