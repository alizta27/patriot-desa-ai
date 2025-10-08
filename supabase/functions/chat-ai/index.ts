import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const OPENAI_API_KEY_2 = Deno.env.get("OPENAI_API_KEY_2");
    if (!OPENAI_API_KEY_2) {
      throw new Error("OPENAI_API_KEY_2 is not configured");
    }

    console.log("Calling OpenAI with messages:", messages);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY_2}`,
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
      console.error("OpenAI API error:", response.status, errorData);

      // Handle rate limit or quota errors
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "OpenAI API rate limit exceeded or quota depleted. Please check your OpenAI account billing.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(
        `OpenAI API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    console.log("OpenAI streaming response started");

    // Create a readable stream that processes the OpenAI stream
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.error(new Error("No response body"));
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode the chunk and add to buffer
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Process complete lines
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              const trimmedLine = line.trim();

              if (trimmedLine === "data: [DONE]") {
                console.log("Stream completed");
                controller.close();
                return;
              }

              if (trimmedLine.startsWith("data: ")) {
                try {
                  const jsonStr = trimmedLine.substring(6);
                  const data = JSON.parse(jsonStr);
                  const content = data.choices?.[0]?.delta?.content;

                  if (content) {
                    // Send the content chunk to the client
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (parseError) {
                  console.warn("Failed to parse SSE data:", parseError);
                  // Continue processing other lines
                }
              }
            }
          }
        } catch (error) {
          console.error("Error processing stream:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat-ai function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
