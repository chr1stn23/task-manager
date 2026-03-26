import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ChevronDown, LogOut, LucideAngularModule, User } from 'lucide-angular';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, ConfirmModalComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  public authService = inject(AuthService);
  private router = inject(Router);

  readonly icons = {
    user: User,
    logout: LogOut,
    chevron: ChevronDown,
  };

  isMenuOpen = signal<boolean>(false);
  showLogoutConfirm = signal<boolean>(false);

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  onLogoutClick() {
    this.isMenuOpen.set(false);
    this.showLogoutConfirm.set(true);
  }

  confirmLogout() {
    this.showLogoutConfirm.set(false);
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  cancelLogout() {
    this.showLogoutConfirm.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.isMenuOpen.set(false);
    }
  }
}
