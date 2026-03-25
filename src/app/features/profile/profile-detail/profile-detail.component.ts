import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionResponseDTO } from '../../../shared/models/response/auth-response.model';
import { SessionService } from '../../../core/services/session.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { Router } from '@angular/router';
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
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent, LucideAngularModule],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.scss',
})
export class ProfileDetailComponent implements OnInit {
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

  showRevokeAllSessionsConfirm = signal<boolean>(false);
  confirmRevokeAllSessionsTitle = signal<string>('Cerrar todas las sesiones');
  confirmRevokeAllSessionsMessage = signal<string>(
    '¿Estás seguro de que quieres cerrar todas las sesiones? Incluida la actual.',
  );

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
    this.sessionService.revokeSession(id).subscribe({
      next: () => {
        this.sessions.update((sessions) => sessions.filter((s) => s.id !== id));
      },
    });
  }

  revokeAllSessions() {
    const userId = this.user()?.id;
    if (userId) {
      this.sessionService.revokeAllSessions().subscribe({
        next: () => {
          this.sessions.set([]);
          this.authService.logout().subscribe(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          console.log('Error al revocar sesiones', err);
        },
      });
    }
  }

  closeRevokeAllSessionsConfirm() {
    this.showRevokeAllSessionsConfirm.set(false);
  }
}
