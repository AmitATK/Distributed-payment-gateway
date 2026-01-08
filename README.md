# 💳 Distributed Payment Gateway & Notification Platform

A **Stripe-like, multi-tenant fintech platform** built with **Node.js, TypeScript, PostgreSQL, Redis (BullMQ), and Angular 20** that supports **idempotent payments, ACID-compliant ledgers, secure webhooks, retries with DLQ, and real-time admin analytics**.

This project demonstrates how **real payment companies** (Stripe, Razorpay, PayPal) design reliable, scalable, and auditable payment infrastructure.

---

## 🚀 Features

### Core Payments
- Idempotent `POST /payments` API
- Multi-tenant merchant support
- Asynchronous payment processing via Redis queues
- ACID-compliant **double-entry ledger**

### Reliability & Recovery
- BullMQ workers with retries and exponential backoff
- Dead Letter Queue (DLQ) for failed webhooks
- Admin API to **replay failed jobs**
- Event & webhook delivery logs

### Security
- HMAC-signed webhooks (Stripe-style)
- API-key based merchant authentication
- Tamper-proof webhook verification

### Observability
- Payment success / failure tracking
- Webhook delivery status
- Revenue & volume analytics
- Real-time Angular Admin Dashboard

### Frontend Apps
- **Admin Dashboard (Angular 20)**
  - Revenue metrics
  - Success / failure counts
  - Webhook failure list
  - Replay buttons
  - Live charts
- **Merchant Checkout Portal (Angular 20)**
  - Customer payment flow
  - Calls payment gateway APIs

---

## 🧩 High-Level Architecture

Customer → Merchant Checkout (Angular)
|
| POST /payments (Idempotent)
v
API Gateway (Node.js + TypeScript)
|
| Enqueue Job
v
Redis (BullMQ)
|
v
Payment Worker
|
| ACID Ledger Writes
v
PostgreSQL
|
v
Webhook Queue
|
v
Webhook Worker → Merchant Webhook (HMAC)
↳ Retries → DLQ → Replay


    Angular Admin Dashboard
---

## 🧠 Key Engineering Concepts

| Concept | Why it matters |
|-------|----------------|
Idempotency | Prevents double-charging on retries |
Double-entry ledger | Guarantees financial correctness |
Async workers | Scalability & fault tolerance |
Webhooks + HMAC | Secure merchant notifications |
DLQ + Replay | Operations & recovery |
Time-series analytics | Revenue & health monitoring |

---

## 📂 Tech Stack

**Backend**
- Node.js + TypeScript
- Express
- PostgreSQL
- Redis + BullMQ

**Frontend**
- Angular 20 (standalone)
- Angular Material
- Chart.js (ng2-charts)

**Infrastructure**
- Redis for queues
- PostgreSQL for ACID storage
- REST APIs + Webhooks

---

## 🔑 Example API

### Create Payment


POST /payments
Headers:
X-API-Key: fk_test_123
Idempotency-Key: order_123

Body:
{
"amount": 100,
"currency": "INR"
}



### Replay Failed Webhook
POST /admin/webhooks/replay/:jobId


---

## 📊 Admin Dashboard

The Admin UI provides:
- Total successful & failed payments
- Revenue & volume
- Revenue trend over time
- Failed webhooks with **Replay** button

This mimics the **Stripe Ops Dashboard**.

---

## 🧪 Real-world scenarios covered

✔ Duplicate client retries  
✔ Webhook failures  
✔ Network instability  
✔ Payment recovery  
✔ Revenue reconciliation  
✔ Ops visibility  


## 👨‍💻 Author

**Amit Kumar**  
Software Engineer | Full-Stack | Fintech | Distributed Systems  

---

If you like this project, ⭐ it and feel free to explore or extend it!
