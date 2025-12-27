import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

app.post("/webhook", (req,res)=>{
  const sig = req.header("X-Signature");
  const body = JSON.stringify(req.body);
  const expected = crypto
    .createHmac("sha256","whsec_abc123")
    .update(body)
    .digest("hex");

  if(sig !== expected) return res.status(401).send("Invalid");

  console.log("Webhook received:", req.body);
  res.send("OK");
});

app.listen(4000,()=>console.log("Merchant webhook on 4000"));
