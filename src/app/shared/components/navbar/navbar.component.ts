import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ChevronDown, LogOut, LucideAngularModule, Menu, User, X } from 'lucide-angular';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { AuthService } from '../../../core/auth/auth.service';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    ConfirmModalComponent,
    AvatarComponent,
  ],
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
    menu: Menu,
    close: X,
  };

  isMenuOpen = signal<boolean>(false);
  showLogoutConfirm = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu() {
    this.isMenuOpen.set(false);
    this.isMobileMenuOpen.update((v) => !v);
  }

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  onLogoutClick() {
    this.isMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
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

    if (
      this.isMobileMenuOpen() &&
      !target.closest('.menu-toggle') &&
      !target.closest('.nav-links')
    ) {
      this.isMobileMenuOpen.set(false);
    }
  }
}
