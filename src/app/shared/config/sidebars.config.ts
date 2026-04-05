import { LayoutDashboard, ShieldCheck, SquareCheck, User, UserPen, Users } from 'lucide-angular';
import { SidebarItem } from '../models/sidebar-item.model';

export const SIDEBARS: Record<string, SidebarItem[]> = {
  profile: [
    { label: 'Vista General', route: 'overview', icon: User },
    { label: 'Editar Perfil', route: 'edit', icon: UserPen },
    { label: 'Seguridad', route: 'security', icon: ShieldCheck },
  ],

  admin: [
    { label: 'Dashboard', route: 'dashboard', icon: LayoutDashboard },
    { label: 'Usuarios', route: 'users', icon: Users },
    { label: 'Tareas', route: 'tasks', icon: SquareCheck },
  ],
};
