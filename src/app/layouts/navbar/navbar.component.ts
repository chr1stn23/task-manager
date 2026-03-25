import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ChevronDown, LogOut, LucideAngularModule, User } from 'lucide-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
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

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.isMenuOpen.set(false);
    }
  }

  onLogout() {
    this.isMenuOpen.set(false);
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
