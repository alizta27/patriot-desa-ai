import { Router } from "express";
import { db } from "../db";
import { profiles, subscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_BASE = "https://app.sandbox.midtrans.com";

// Create subscription payment token - replaces create-subscription Edge Function
router.post("/create", async (req, res) => {
  try {
    const { user_id, customer_name, customer_email } = req.body;

    if (!user_id || !customer_name || !customer_email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const amount = 99000;

    const snapPayload = {
      transaction_details: {
        order_id: `ONETIME-${Date.now()}-${user_id.substring(0, 8)}`,
        gross_amount: amount.toString(),
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: customer_name,
        email: customer_email,
      },
      enabled_payments: ["credit_card"],
      custom_field1: user_id,
    };

    const response = await fetch(`${MIDTRANS_BASE}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64"),
      },
      body: JSON.stringify(snapPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.json({
      success: true,
      snap_token: data.token,
      redirect_url: data.redirect_url,
      message: "Payment token created successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Check subscription status - replaces check-subscription Edge Function
router.post("/check", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user_id)).limit(1);

    if (!profile) {
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    const now = new Date();
    const expiryDate = profile.subscriptionExpiry ? new Date(profile.subscriptionExpiry) : null;

    if (profile.subscriptionStatus === "premium" && expiryDate && expiryDate < now) {
      await db.update(profiles)
        .set({
          subscriptionStatus: "free",
          subscriptionExpiry: null,
        })
        .where(eq(profiles.id, user_id));

      await db.update(subscriptions)
        .set({
          plan: "free",
          endDate: null,
        })
        .where(eq(subscriptions.userId, user_id));

      return res.json({
        status: "free",
        expired: true,
        message: "Subscription expired and downgraded to free",
      });
    }

    res.json({
      status: profile.subscriptionStatus,
      expiry: profile.subscriptionExpiry,
      expired: false,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Midtrans subscription - replaces midtrans-subscription Edge Function
router.post("/midtrans", async (req, res) => {
  try {
    const { user_id, customer_name, customer_email, card_token } = req.body;
    const amount = 99000;

    if (!user_id || !customer_name || !customer_email) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    if (!card_token) {
      const snapResp = await fetch(`${MIDTRANS_BASE}/snap/v1/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64"),
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: `FIRST-PAY-${Date.now()}-${user_id.substring(0, 8)}`,
            gross_amount: amount.toString(),
          },
          credit_card: {
            secure: true,
            save_card: true,
          },
          customer_details: {
            first_name: customer_name,
            email: customer_email,
          },
          enabled_payments: ["credit_card"],
          custom_field1: user_id,
        }),
      });

      const snapData = await snapResp.json();
      if (!snapResp.ok) {
        return res.status(snapResp.status).json({ error: snapData });
      }

      return res.json({
        snap_token: snapData.token,
        redirect_url: snapData.redirect_url,
        step: "first_payment",
      });
    }

    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const start_time = startTime.toISOString().replace("Z", "+07:00");

    const subscriptionPayload = {
      name: `MONTHLY_${new Date().getFullYear()}`,
      amount: amount.toString(),
      currency: "IDR",
      payment_type: "credit_card",
      token: card_token,
      custom_field1: user_id,
      schedule: {
        interval: 1,
        interval_unit: "month",
        max_interval: 12,
        start_time: start_time,
      },
      retry_schedule: {
        interval: 1,
        interval_unit: "day",
        max_interval: 3,
      },
      metadata: {
        description: "Patriot Desa Premium Subscription",
        user_id: user_id,
      },
      customer_details: {
        first_name: customer_name,
        email: customer_email,
      },
    };

    const resp = await fetch(`https://api.sandbox.midtrans.com/v1/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64"),
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data });
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await db.update(profiles)
      .set({
        lastPaymentId: data.id,
        subscriptionStatus: "premium",
        subscriptionExpiry: endDate.toISOString(),
      })
      .where(eq(profiles.id, user_id));

    await db.update(subscriptions)
      .set({
        plan: "premium",
        endDate: endDate.toISOString(),
        amountPaid: amount.toString(),
      })
      .where(eq(subscriptions.userId, user_id));

    res.json({
      success: true,
      subscription_id: data.id,
      subscription_name: data.name,
      status: data.status,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Midtrans token - replaces midtrans-token Edge Function
router.post("/token", async (req, res) => {
  try {
    const { order_id, gross_amount, customer_name, customer_email, user_id } = req.body;

    if (!order_id || !gross_amount || !customer_name || !customer_email) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const snapRes = await fetch(`${MIDTRANS_BASE}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Basic " + Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64"),
      },
      body: JSON.stringify({
        transaction_details: { order_id, gross_amount },
        customer_details: {
          first_name: customer_name,
          email: customer_email,
        },
      }),
    });

    const snapData = await snapRes.json();

    if (!snapRes.ok) {
      return res.status(snapRes.status).json({ error: snapData });
    }

    await db.update(profiles)
      .set({ paymentToken: snapData.token })
      .where(eq(profiles.id, user_id));

    res.json({ token: snapData.token });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export { router as subscriptionRoutes };
