import { useEffect, useMemo, useState } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStudyStore } from "@/store/useStudyStore";
import { useTasks } from "@/hooks/useTasks";
import { TasksCalendar } from "@/components/tasks/TasksCalendar";
import { TaskListPanel } from "@/components/tasks/TaskListPanel";
import { AddTaskDialog } from "@/components/tasks/AddTaskDialog";
import { Task } from "@/types/tasks";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getGoogleOAuthURL } from "@/lib/googleOAuth";

const Tasks = () => {
  const userId = useStudyStore((state) => state.userId);
  const { toast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // TODO: replace with actual Google OAuth access token from auth context
  const googleAccessToken = undefined;

  const { tasks, isLoading, createTask, isCreating, refetch } = useTasks({
    userId,
    month: currentMonth,
    accessToken: googleAccessToken,
  });
  const [hasGoogleCalendarConnected, setHasGoogleCalendarConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkConnection = async () => {
      // TODO: Replace this with a real API call that checks the user's Google Calendar connection
      if (isMounted) {
        setHasGoogleCalendarConnected(false);
      }
    };

    checkConnection();
    return () => {
      isMounted = false;
    };
  }, []);

  const tasksByDate = useMemo<Record<string, Task[]>>(() => {
    return tasks.reduce((acc, task) => {
      const key = format(parseISO(task.startTime), "yyyy-MM-dd");
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const selectedTasks = tasksByDate[format(selectedDate, "yyyy-MM-dd")] || [];
  const handleConnectGoogle = () => {
    window.location.href = getGoogleOAuthURL();
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(startOfMonth(date));
    }
  };

  const handleCreateTask = async (payload: Parameters<typeof createTask>[0]) => {
    try {
      await createTask(payload);
      toast({
        title: "Task added",
        description: "Your manual task is now tracked in StudyPal.",
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        title: "Unable to add task",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
          <p className="text-lg font-semibold text-foreground">Preparing your tasks...</p>
          <p className="text-sm text-muted-foreground">Please wait while we load your StudyPal session.</p>
        </Card>
      </div>
    );
  }

  const isCalendarLoading = isLoading && tasks.length === 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4 sm:space-y-6"
      >
        {/* Header: stacks on mobile, row on larger screens */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
              Tasks Manager
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Monitor all your study tasks from Google Calendar and StudyPal in one place.
            </p>
          </div>
          {/* Buttons: wrap and adjust size on mobile */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {!hasGoogleCalendarConnected && (
              <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={handleConnectGoogle}>
                Connect Google
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
              onClick={() => {
                void refetch();
              }}
              disabled={!hasGoogleCalendarConnected || isLoading}
            >
              {isLoading ? "Syncing..." : "Sync Now"}
            </Button>
            <Button size="sm" className="text-xs sm:text-sm" onClick={() => setIsDialogOpen(true)}>
              + Add Task
            </Button>
          </div>
        </div>

        {/* Calendar + Task List: single column mobile, two columns desktop */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr,1.4fr]">
          <TasksCalendar
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onMonthChange={(date) => setCurrentMonth(startOfMonth(date))}
            onGoToToday={() => {
              const today = new Date();
              setCurrentMonth(startOfMonth(today));
              setSelectedDate(today);
            }}
            tasksByDate={tasksByDate}
            isLoading={isCalendarLoading}
          />

          <TaskListPanel
            date={selectedDate}
            tasks={selectedTasks}
            isLoading={isLoading && tasks.length === 0 && selectedTasks.length === 0}
            onAddTask={() => setIsDialogOpen(true)}
          />
        </div>
      </motion.div>

      <AddTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
        onSubmit={handleCreateTask}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default Tasks;

