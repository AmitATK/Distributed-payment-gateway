import { Component } from '@angular/core';
import { PaymentService } from './services/payment.service';

@Component({
  standalone:true,
  template:`
  <h1>Pay ₹100</h1>
  <button (click)="pay()">Pay Now</button>
  <p>{{message}}</p>
  `
})
export class CheckoutComponent {
  message = '';

  constructor(private paySvc: PaymentService) {}

  pay(){
    this.paySvc.createPayment(100).subscribe({
      next: () => this.message = "Payment Successful!",
      error: () => this.message = "Payment Failed"
    });
  }
}
