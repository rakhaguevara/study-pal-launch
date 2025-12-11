import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 👉 OPTION 1: langsung pakai URL webhook (hardcode)
const N8N_WEBHOOK_URL =
  "https://ventriloquistic-holden-acapnial.ngrok-free.dev/webhook/studypal-ai";

// 👉 OPTION 2 (lebih rapih): pakai ENV di Supabase (kalau mau)
// const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const messages = body?.messages;

    if (!Array.isArray(messages)) {
      throw new Error("messages is required and must be an array");
    }

    // Ambil pesan user terakhir
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user")?.content;

    if (!lastUserMessage || typeof lastUserMessage !== "string") {
      throw new Error("No user message found");
    }

    // Kirim ke webhook n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: lastUserMessage }),
    });

    if (!n8nResponse.ok) {
      const text = await n8nResponse.text();
      console.error("n8n error:", n8nResponse.status, text);
      return new Response(
        JSON.stringify({ error: "Failed to get response from n8n" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const n8nData = await n8nResponse.json();
    const aiMessage =
      n8nData?.message ||
      "Maaf, aku tidak bisa menjawab saat ini. Coba lagi sebentar lagi ya 😊";

    // Balas ke frontend dengan format yang sama seperti sebelumnya
    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Unknown error in chat",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
