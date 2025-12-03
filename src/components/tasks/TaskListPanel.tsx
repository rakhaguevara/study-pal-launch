import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Task } from "@/types/tasks";
import { format, isBefore, parseISO } from "date-fns";
import { CalendarClock, CalendarDays, Plus } from "lucide-react";

interface TaskListPanelProps {
  date: Date;
  tasks: Task[];
  isLoading?: boolean;
  onAddTask: () => void;
}

export const TaskListPanel = ({ date, tasks, isLoading, onAddTask }: TaskListPanelProps) => {
  // Shorter date format on mobile
  const formattedDate = format(date, "EEEE, MMMM d");
  const formattedDateShort = format(date, "EEE, MMM d");

  return (
    <Card className="rounded-xl sm:rounded-2xl border-border shadow-md">
      {/* Responsive header */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-border/60 bg-background/80 p-3 sm:p-4 lg:p-6">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Selected date</p>
          <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold truncate">
            <span className="hidden sm:inline">{formattedDate}</span>
            <span className="sm:hidden">{formattedDateShort}</span>
          </CardTitle>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] sm:text-xs">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </Badge>
          <Button onClick={onAddTask} size="sm" className="text-xs sm:text-sm h-8">
            <Plus className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
            <Skeleton className="h-16 sm:h-20 w-full rounded-lg sm:rounded-xl" />
            <Skeleton className="h-16 sm:h-20 w-full rounded-lg sm:rounded-xl" />
            <Skeleton className="h-16 sm:h-20 w-full rounded-lg sm:rounded-xl" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="space-y-3 p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-foreground">No tasks for this day</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Keep the momentum going by planning a new study task.
              </p>
            </div>
            <Button variant="outline" onClick={onAddTask} className="w-full sm:w-auto text-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] sm:max-h-[480px] lg:max-h-[560px] p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3 pr-2">
              {tasks.map((task) => (
                <TaskItem key={`${task.source}-${task.id}`} task={task} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

const TaskItem = ({ task }: { task: Task }) => {
  const start = parseISO(task.startTime);
  const end = parseISO(task.endTime);
  const overdue = isBefore(end, new Date());

  return (
    <div className="rounded-lg sm:rounded-xl border border-border bg-card/80 p-3 sm:p-4 shadow-sm transition hover:border-primary/60 hover:shadow-md">
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-semibold text-foreground truncate">{task.title}</p>
          {task.subject && <p className="text-xs sm:text-sm text-muted-foreground truncate">{task.subject}</p>}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Badge
            variant={task.source === "google" ? "secondary" : "default"}
            className={cn(
              "text-[10px] sm:text-xs",
              task.source === "google" && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100",
              task.source === "manual" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100",
            )}
          >
            <span className="hidden sm:inline">{task.source === "google" ? "Google Calendar" : "Manual"}</span>
            <span className="sm:hidden">{task.source === "google" ? "Google" : "Manual"}</span>
          </Badge>
          {overdue && (
            <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-100 text-[10px] sm:text-xs">
              Overdue
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
        <span>
          {format(start, "HH:mm")} – {format(end, "HH:mm")}
        </span>
      </div>
      {task.description && (
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      )}
    </div>
  );
};

