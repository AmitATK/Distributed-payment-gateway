import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  base = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createPayment(amount: number) {
    return this.http.post(`${this.base}/payments`, {
      amount,
      currency: 'INR'
    }, {
      headers: {
        'X-API-Key': 'fk_test_123',
        'Idempotency-Key': crypto.randomUUID()
      }
    });
  }
}
