import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  imageUrl = input<string | null>();
  firstName = input<string | undefined>('');
  lastName = input<string | undefined>('');
  size = input<number>(28);
  altText = input<string>('User avatar');

  initials = computed(() => {
    const f = this.firstName()?.charAt(0) || '';
    const l = this.lastName()?.charAt(0) || '';

    return `${f}${l}` || '?';
  });

  fontSize = computed(() => this.size() * 0.4);

  borderRadius = computed(() => (this.size() * 8) / 28);
}
