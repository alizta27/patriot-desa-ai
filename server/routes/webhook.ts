import { Router } from "express";
import { db } from "../db";
import { profiles, subscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Midtrans webhook - replaces midtrans-webhook Edge Function
router.post("/midtrans", async (req, res) => {
  try {
    const body = req.body;
    console.log("Webhook received:", JSON.stringify(body));

    const transaction_status = body.transaction_status;
    const order_id = body.order_id;
    const subscription_id = body.subscription_id;

    const user_id = body.custom_field1 || body.metadata?.user_id;

    if (!user_id) {
      console.error("No user_id found in webhook data");
      return res.status(400).send("Invalid webhook data - missing user_id");
    }

    if (subscription_id) {
      const status = body.status;
      const updates: any = {
        lastPaymentId: subscription_id,
      };

      if (status === "active") {
        updates.subscriptionStatus = "premium";
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        updates.subscriptionExpiry = endDate.toISOString();
      } else if (status === "expired" || status === "cancelled") {
        updates.subscriptionStatus = "free";
        updates.subscriptionExpiry = null;
      }

      await db.update(profiles)
        .set(updates)
        .where(eq(profiles.id, user_id));

      if (status === "active") {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await db.update(subscriptions)
          .set({
            plan: "premium",
            endDate: endDate.toISOString(),
            amountPaid: body.gross_amount || "99000",
          })
          .where(eq(subscriptions.userId, user_id));
      }
    }

    if (transaction_status === "settlement" || transaction_status === "capture") {
      const isFirstPayment = order_id && order_id.startsWith("FIRST-PAY");

      if (isFirstPayment) {
        console.log("First payment completed, user can now create subscription");
        await db.update(profiles)
          .set({ lastPaymentId: order_id })
          .where(eq(profiles.id, user_id));
      } else {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await db.update(profiles)
          .set({
            subscriptionStatus: "premium",
            subscriptionExpiry: endDate.toISOString(),
            lastPaymentId: order_id,
          })
          .where(eq(profiles.id, user_id));

        await db.update(subscriptions)
          .set({
            plan: "premium",
            endDate: endDate.toISOString(),
            amountPaid: body.gross_amount,
          })
          .where(eq(subscriptions.userId, user_id));
      }
    }

    res.send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Error");
  }
});

// Payment webhook - replaces payment-webhook Edge Function
router.post("/payment", async (req, res) => {
  try {
    const body = req.body;
    console.log("Webhook received:", JSON.stringify(body));

    const { transaction_status, order_id, custom_field1 } = body;
    const user_id = custom_field1;

    if (!user_id) {
      console.error("No user_id found in webhook");
      return res.status(400).send("Missing user_id");
    }

    if (order_id && order_id.startsWith("ONETIME-") && transaction_status === "settlement") {
      console.log("One-time payment completed, upgrading user to premium...");

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await db.update(profiles)
        .set({
          subscriptionStatus: "premium",
          subscriptionExpiry: endDate.toISOString(),
          lastPaymentId: order_id,
        })
        .where(eq(profiles.id, user_id));

      await db.update(subscriptions)
        .set({
          plan: "premium",
          endDate: endDate.toISOString(),
          amountPaid: body.gross_amount || "99000",
        })
        .where(eq(subscriptions.userId, user_id));

      console.log(`User ${user_id} upgraded to premium until ${endDate.toISOString()}`);
    }

    res.send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Error");
  }
});

export { router as webhookRoutes };
