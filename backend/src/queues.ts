import { Queue } from "bullmq";
import { redis } from "./redis";

export const paymentQueue = new Queue("payments", {
  connection: redis
});

export const webhookQueue = new Queue("webhooks", {
  connection: redis
});
