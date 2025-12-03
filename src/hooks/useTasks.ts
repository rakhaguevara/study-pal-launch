import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";
import { fetchManualTasks, createManualTask } from "@/services/tasks";
import { fetchGoogleCalendarTasks } from "@/services/googleCalendar";
import { CreateTaskPayload, Task } from "@/types/tasks";

interface UseTasksParams {
  userId?: string | null;
  month: Date;
  accessToken?: string;
}

export const useTasks = ({ userId, month, accessToken }: UseTasksParams) => {
  const queryClient = useQueryClient();

  const timeRange = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
    };
  }, [month]);

  const tasksQuery = useQuery<Task[]>({
    queryKey: ["tasks", userId, timeRange.timeMin, timeRange.timeMax],
    enabled: Boolean(userId),
    queryFn: async () => {
      const [manualTasks, googleTasks] = await Promise.all([
        fetchManualTasks({ userId, timeMin: timeRange.timeMin, timeMax: timeRange.timeMax }),
        fetchGoogleCalendarTasks({ accessToken, timeMin: timeRange.timeMin, timeMax: timeRange.timeMax }),
      ]);

      return [...manualTasks, ...googleTasks].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => {
      if (!userId) {
        throw new Error("User ID is required to create a task");
      }
      return createManualTask({ userId, ...payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isRefetching: tasksQuery.isRefetching,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    createTask: (payload: CreateTaskPayload) => createTaskMutation.mutateAsync(payload),
    isCreating: createTaskMutation.isLoading,
    timeRange,
  };
};

