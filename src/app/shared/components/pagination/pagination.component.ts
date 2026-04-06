import { Component, input, output, computed } from '@angular/core';
import { Page } from '../../models/page.model';
import { TaskResponseDTO } from '../../models/response/task-response.model';
import { UserListResponseDTO } from '../../models/response/user-response.model';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';

type PageItem = { type: 'page'; value: number } | { type: 'dots' };

@Component({
  selector: 'app-pagination',
  imports: [LucideAngularModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  page = input.required<Page<TaskResponseDTO | UserListResponseDTO>>();
  pageChange = output<number>();

  protected readonly icons = {
    prev: ChevronLeft,
    next: ChevronRight,
  };

  visiblePages = computed<PageItem[]>(() => {
    const current = this.page().page;
    const total = this.page().totalPages;

    const delta = 2;
    const pages: PageItem[] = [];

    const start = Math.max(0, current - delta);
    const end = Math.min(total - 1, current + delta);

    if (start > 0) {
      pages.push({ type: 'page', value: 0 });
      if (start > 1) pages.push({ type: 'dots' });
    }

    for (let i = start; i <= end; i++) {
      pages.push({ type: 'page', value: i });
    }

    if (end < total - 1) {
      if (end < total - 2) pages.push({ type: 'dots' });
      pages.push({ type: 'page', value: total - 1 });
    }

    return pages;
  });

  goTo(page: number) {
    if (page !== this.page().page) {
      this.pageChange.emit(page);
    }
  }

  goToInput(value: string) {
    const page = Number(value);

    if (isNaN(page)) return;

    const total = this.page().totalPages;

    const target = Math.max(1, Math.min(page, total));

    this.goTo(target - 1);
  }

  next() {
    const page = this.page();
    if (page.hasNext) {
      this.pageChange.emit(page.page + 1);
    }
  }

  prev() {
    const page = this.page();
    if (page.hasPrevious) {
      this.pageChange.emit(page.page - 1);
    }
  }
}
