import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) { }

  getPaymentStats() {
    return this.http.get<any>(`${this.base}/payments/stats`);
  }

  getFailedWebhooks() {
    return this.http.get<any[]>(`${this.base}/webhooks/failed`);
  }

  replay(jobId: string) {
    return this.http.post(`${this.base}/webhooks/replay/${jobId}`, {});
  }

  getWebhookStats() {
    return this.http.get<any>(`${this.base}/webhooks/stats`);
  }

  getRevenueTimeline() {
    return this.http.get<any[]>('http://localhost:3000/admin/revenue/timeline');
  }

}
