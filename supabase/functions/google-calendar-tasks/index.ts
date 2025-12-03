import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let payload: Record<string, unknown> = {};
    try {
      payload = await req.json();
    } catch {
      // ignore if body is empty
    }

    const { timeMin, timeMax, accessToken } = payload as {
      timeMin?: string;
      timeMax?: string;
      accessToken?: string;
    };

    // TODO: Validate Supabase auth session and retrieve the user's Google OAuth token securely.
    // The `accessToken` passed from the client is a placeholder and should be replaced
    // with a token fetched from encrypted storage or a server-side auth exchange.

    // TODO: Call Google Calendar API (events.list) using the verified Google access token.
    // Example endpoint: https://www.googleapis.com/calendar/v3/calendars/primary/events
    // Include timeMin/timeMax as query parameters to limit the range.
    // For now, we return an empty array to keep the contract intact.

    const tasks = [
      // Example structure:
      // {
      //   id: "google-event-id",
      //   title: "Sample Google Calendar Event",
      //   subject: null,
      //   description: "Replace this with the event description",
      //   startTime: timeMin,
      //   endTime: timeMax,
      //   source: "google" as const,
      //   createdAt: new Date().toISOString(),
      //   updatedAt: new Date().toISOString(),
      // }
    ];

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("google-calendar-tasks error:", error);
    return new Response(JSON.stringify({ error: "Failed to sync Google Calendar tasks" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

