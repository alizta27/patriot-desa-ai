import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

// Chat AI endpoint - replaces chat-ai Edge Function
router.post("/ai", async (req, res) => {
  try {
    const { messages } = req.body;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY_2;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key is not configured" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        stream: true,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah Patriot Desa, asisten AI yang membantu pengelolaan desa. Berikan jawaban yang informatif, praktis, dan ramah untuk membantu aparatur desa, pendamping desa, BUMDes/Kopdes, dan masyarakat umum.",
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        return res.status(429).json({
          error: "OpenAI API rate limit exceeded or quota depleted. Please check your OpenAI account billing.",
        });
      }
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`);
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream the response
    const reader = response.body;
    if (!reader) {
      throw new Error("No response body");
    }

    reader.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === "data: [DONE]") {
          res.end();
          return;
        }
        if (trimmedLine.startsWith("data: ")) {
          try {
            const jsonStr = trimmedLine.substring(6);
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              res.write(content);
            }
          } catch (parseError) {
            // Continue processing other lines
          }
        }
      }
    });

    reader.on("end", () => {
      res.end();
    });

    reader.on("error", (error: Error) => {
      console.error("Stream error:", error);
      res.end();
    });
  } catch (error) {
    console.error("Error in chat-ai:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as chatRoutes };
