import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild, OnInit, signal, OnDestroy } from '@angular/core';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { AdminDashboardDTO } from '../../../../../shared/models/response/admin-dashboard.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss',
})
export class AdminDashboardPageComponent implements OnInit, OnDestroy {
  @ViewChild('statusChart') statusChartCanvas!: ElementRef;
  @ViewChild('priorityChart') priorityChartCanvas!: ElementRef;

  private dashboardService = inject(AdminDashboardService);
  stats = signal<AdminDashboardDTO | null>(null);
  private charts: Chart[] = [];

  private statusMap: Record<string, string> = {
    TODO: 'PENDIENTE',
    IN_PROGRESS: 'EN PROGRESO',
    DONE: 'COMPLETADO',
  };

  private priorityMap: Record<string, string> = {
    LOW: 'BAJO',
    MEDIUM: 'MEDIO',
    HIGH: 'ALTO',
  };

  ngOnInit() {
    this.loadData();
    window.addEventListener('resize', () => this.recreateCharts());
  }

  ngOnDestroy() {
    this.destroyCharts();
    window.removeEventListener('resize', () => this.recreateCharts());
  }

  loadData() {
    this.dashboardService.getDashboardStats().subscribe((res) => {
      if (res.success && res.data) {
        this.stats.set(res.data);
        setTimeout(() => {
          this.createStatusChart();
          this.createPriorityChart();
        }, 100);
      }
    });
  }

  private translateStatus(status: string): string {
    return this.statusMap[status] || status;
  }

  private translatePriority(priority: string): string {
    return this.priorityMap[priority] || priority;
  }

  chardColors = ['#818cf8', '#34d399', '#22d3ee'];

  createStatusChart() {
    const data = this.stats();
    if (!data || !this.statusChartCanvas) return;

    if (this.charts[0]) {
      this.charts[0].destroy();
    }

    const ctx = this.statusChartCanvas.nativeElement.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.tasksByStatus.map((s) => this.translateStatus(s.status)),
        datasets: [
          {
            data: data.tasksByStatus.map((s) => s.count),
            backgroundColor: this.chardColors.slice(0, data.tasksByStatus.length),
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 15,
              padding: 10,
              font: { size: 12, weight: 500 },
              color: '#6b7280',
              pointStyle: 'rectRounded',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            padding: 12,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
            borderColor: 'rgba(99, 102, 241, 0.2)',
            borderWidth: 1,
            displayColors: true,
          },
        },
      },
    });

    this.charts[0] = chart;
  }

  createPriorityChart() {
    const data = this.stats();
    if (!data || !this.priorityChartCanvas) return;

    if (this.charts[1]) {
      this.charts[1].destroy();
    }

    const ctx = this.priorityChartCanvas.nativeElement.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.tasksByPriority.map((s) => this.translatePriority(s.priority)),
        datasets: [
          {
            data: data.tasksByPriority.map((s) => s.count),
            backgroundColor: this.chardColors.slice(0, data.tasksByPriority.length),
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              padding: 10,
              font: { size: 12, weight: 500 },
              color: '#6b7280',
              pointStyle: 'rectRounded',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            padding: 12,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
            borderColor: 'rgba(99, 102, 241, 0.2)',
            borderWidth: 1,
            displayColors: true,
          },
        },
      },
    });

    this.charts[1] = chart;
  }

  private recreateCharts() {
    this.destroyCharts();
    this.createStatusChart();
    this.createPriorityChart();
  }

  private destroyCharts() {
    this.charts.forEach((chart) => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = [];
  }
}
