import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/tasks";

interface FetchGoogleCalendarTasksParams {
  accessToken?: string;
  timeMin: string;
  timeMax: string;
}

export async function fetchGoogleCalendarTasks({
  accessToken,
  timeMin,
  timeMax,
}: FetchGoogleCalendarTasksParams): Promise<Task[]> {
  try {
    const { data, error } = await supabase.functions.invoke("google-calendar-tasks", {
      body: {
        timeMin,
        timeMax,
        accessToken, // TODO: replace with real user token from auth context when backend is ready
      },
    });

    if (error) {
      throw error;
    }

    return Array.isArray(data?.tasks) ? (data.tasks as Task[]) : [];
  } catch (error) {
    console.warn("Google Calendar service is not fully configured yet:", error);
    return [];
  }
}

