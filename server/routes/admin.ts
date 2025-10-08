import { Router } from "express";
import { db } from "../db";
import { profiles, activityLogs, appSettings, chats, chatMessages, subscriptions } from "@shared/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

const router = Router();

// Get dashboard stats
router.get("/dashboard/stats", async (req, res) => {
  try {
    const stats = await db.execute(sql`
      WITH role_counts AS (
        SELECT
          COUNT(*) FILTER (WHERE role = 'aparatur') AS aparatur,
          COUNT(*) FILTER (WHERE role = 'pendamping') AS pendamping,
          COUNT(*) FILTER (WHERE role = 'bumdes') AS bumdes,
          COUNT(*) FILTER (WHERE role = 'umum') AS umum,
          COUNT(*) AS total_users,
          COUNT(*) FILTER (WHERE subscription_status = 'premium') AS premium_users
        FROM ${profiles}
      ),
      question_counts AS (
        SELECT COUNT(*) AS total_questions
        FROM ${chatMessages}
        WHERE role = 'user'
      ),
      revenue AS (
        SELECT COALESCE(SUM(amount_paid), 0)::NUMERIC(12,2) AS total_revenue
        FROM ${subscriptions}
      )
      SELECT
        rc.total_users AS "totalUsers",
        rc.aparatur AS "aparatur",
        rc.pendamping AS "pendamping",
        rc.bumdes AS "bumdes",
        rc.umum AS "umum",
        qc.total_questions AS "totalQuestions",
        rc.premium_users AS "premiumUsers",
        COALESCE(r.total_revenue, 0) AS "totalRevenue"
      FROM role_counts rc, question_counts qc, revenue r
    `);

    res.json(stats.rows[0] || {});
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Get user growth data
router.get("/dashboard/user-growth", async (req, res) => {
  try {
    const growth = await db.execute(sql`
      SELECT
        to_char(date_trunc('month', created_at), 'Mon') AS month,
        COUNT(*) AS users
      FROM ${profiles}
      WHERE created_at >= (date_trunc('month', NOW()) - INTERVAL '11 months')
      GROUP BY 1
      ORDER BY MIN(date_trunc('month', created_at))
    `);

    res.json(growth.rows);
  } catch (err) {
    console.error("Error fetching user growth:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Get query distribution
router.get("/dashboard/query-distribution", async (req, res) => {
  try {
    const distribution = await db.execute(sql`
      SELECT
        COALESCE(category::TEXT, 'lainnya') AS category,
        COUNT(*) AS value
      FROM ${chatMessages}
      WHERE role = 'user'
      GROUP BY 1
      ORDER BY 2 DESC
    `);

    res.json(distribution.rows);
  } catch (err) {
    console.error("Error fetching query distribution:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await db.select().from(profiles).orderBy(desc(profiles.createdAt));
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Get activity logs
router.get("/activity", async (req, res) => {
  try {
    const logs = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(100);
    res.json(logs);
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Get app settings
router.get("/settings", async (req, res) => {
  try {
    const [settings] = await db.select().from(appSettings).limit(1);
    res.json(settings || {});
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Update app settings
router.put("/settings", async (req, res) => {
  try {
    const updates = req.body;
    const [existing] = await db.select().from(appSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(appSettings)
        .set(updates)
        .where(eq(appSettings.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(appSettings).values(updates).returning();
      res.json(created);
    }
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updated] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export { router as adminRoutes };
