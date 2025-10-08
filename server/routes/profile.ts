import { Router } from "express";
import { db } from "../db";
import { profiles, chats, chatMessages, activityLogs } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// Get user profile
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Update user profile
router.put("/:id", async (req, res) => {
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
    console.error("Error updating profile:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Get user chats
router.get("/:id/chats", async (req, res) => {
  try {
    const { id } = req.params;
    const userChats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, id))
      .orderBy(desc(chats.updatedAt));

    res.json(userChats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Create new chat
router.post("/:id/chats", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const [newChat] = await db
      .insert(chats)
      .values({
        userId: id,
        title: title || "New Chat",
      })
      .returning();

    res.json(newChat);
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Get chat messages
router.get("/chats/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatId, chatId))
      .orderBy(chatMessages.createdAt);

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Create chat message
router.post("/chats/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { role, message, category } = req.body;

    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        chatId,
        role,
        message,
        category,
      })
      .returning();

    res.json(newMessage);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Log activity
router.post("/:id/activity", async (req, res) => {
  try {
    const { id } = req.params;
    const { action, details, type } = req.body;

    const [log] = await db
      .insert(activityLogs)
      .values({
        userId: id,
        action,
        details,
        type,
      })
      .returning();

    res.json(log);
  } catch (err) {
    console.error("Error logging activity:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export { router as profileRoutes };
