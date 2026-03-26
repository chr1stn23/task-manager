import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../../core/services/session.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { SessionResponseDTO } from '../../../../shared/models/response/auth-response.model';
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
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent, LucideAngularModule],
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.scss',
})
export class ProfileOverviewComponent implements OnInit {
  private sessionService = inject(SessionService);
  public authService = inject(AuthService);
  private router = inject(Router);

  readonly icons = {
    windows: Monitor,
    mac: Laptop,
    smartphone: Smartphone,
    ios: TabletSmartphone,
    linux: Terminal,
    unknown: CircleQuestionMark,
  };

  user = this.authService.currentUser;

  sessions = signal<SessionResponseDTO[]>([]);
  isLoadingSessions = signal<boolean>(false);

  showConfirmModal = signal<boolean>(false);
  modalConfig = signal({ title: '', message: '', confirmText: '', action: () => {} });
  selectedSessionId = signal<number | null>(null);

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
      action: () => this.executeRevoke(id),
    });
    this.showConfirmModal.set(true);
  }

  onRevokeAll() {
    this.modalConfig.set({
      title: 'Cerrar todas las sesiones',
      message: '¿Estás seguro de que quieres cerrar todas las sesiones? Incluida la actual.',
      confirmText: 'Cerrar Todas',
      action: () => this.revokeAllSessions(),
    });
    this.showConfirmModal.set(true);
  }

  private executeRevoke(id: number) {
    this.sessionService.revokeSession(id).subscribe({
      next: () => {
        this.sessions.update((sessions) => sessions.filter((s) => s.id !== id));
        this.showConfirmModal.set(false);
      },
    });
  }

  private revokeAllSessions() {
    this.sessionService.revokeAllSessions().subscribe({
      next: () => {
        this.showConfirmModal.set(false);
        this.authService.logout().subscribe(() => this.router.navigate(['/login']));
      },
    });
  }
}
