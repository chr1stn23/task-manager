import { LucideIconData } from 'lucide-angular';

export interface SidebarItem {
  label: string;
  icon?: LucideIconData;
  route: string;
}
