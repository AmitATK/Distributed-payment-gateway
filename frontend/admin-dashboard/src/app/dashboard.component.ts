import { Component } from '@angular/core';
import { ApiService } from './services/api.service';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  standalone: true,
  imports: [MatCardModule, BaseChartDirective],
  template: `
  <div class="grid">
    <mat-card class="kpi success">
      <div>Success</div>
      <h1>{{ stats?.success }}</h1>
    </mat-card>

    <mat-card class="kpi fail">
      <div>Failed</div>
      <h1>{{ stats?.failed }}</h1>
    </mat-card>

    <mat-card class="kpi volume">
      <div>Total Volume</div>
      <h1>₹{{ stats?.total_volume }}</h1>
    </mat-card>
  </div>

  <mat-card class="chart">
    <h3>Revenue Trend</h3>
    <canvas
      baseChart
      [data]="lineChartData"
      [options]="lineChartOptions"
      [type]="'line'">
    </canvas>
  </mat-card>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    .kpi {
      padding: 20px;
      text-align: center;
      border-radius: 12px;
    }
    .success { background: #e8f5e9; }
    .fail { background: #ffebee; }
    .volume { background: #e3f2fd; }
    .chart { padding: 20px; border-radius: 12px; }
  `]
})
export class DashboardComponent {

  stats: any;

  // Correctly typed chart data
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Revenue',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Correctly typed chart options
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    scales: {
      x: {
        type: 'category'
      },
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(private api: ApiService) {
    this.api.getPaymentStats().subscribe(d => this.stats = d);

    this.api.getRevenueTimeline().subscribe(rows => {
      const labels = rows.map(r => r.day);
      const data = rows.map(r => Number(r.revenue));

      // Replace entire object so ng2-charts refreshes
      this.lineChartData = {
        labels,
        datasets: [
          {
            data,
            label: 'Revenue',
            fill: true,
            tension: 0.4
          }
        ]
      };
    });
  }
}
