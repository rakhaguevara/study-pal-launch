import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Task } from "@/types/tasks";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Short day names for mobile, could use even shorter on xs screens
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

interface TasksCalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  onGoToToday: () => void;
  tasksByDate: Record<string, Task[]>;
  isLoading?: boolean;
}

export const TasksCalendar = ({
  currentMonth,
  selectedDate,
  onSelectDate,
  onMonthChange,
  onGoToToday,
  tasksByDate,
  isLoading,
}: TasksCalendarProps) => {
  const calendarDays = getCalendarGrid(currentMonth);

  return (
    <Card className="rounded-xl sm:rounded-2xl border-border shadow-md overflow-hidden">
      {/* Calendar Header */}
      <CardHeader className="flex flex-col gap-3 sm:gap-4 border-b border-border/60 bg-gradient-to-br from-background to-background/70 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">Current month</p>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 px-2 sm:px-3" onClick={onGoToToday}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              aria-label="Previous month"
              onClick={() => onMonthChange(addMonths(currentMonth, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              aria-label="Next month"
              onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Calendar Grid */}
      <CardContent className="p-2 sm:p-4 lg:p-6">
        {isLoading ? (
          <Skeleton className="h-[280px] sm:h-[320px] lg:h-[360px] w-full rounded-xl" />
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {/* Day names row - shorter on mobile */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {DAY_NAMES.map((day, i) => (
                <span key={day} className="hidden sm:inline">{day}</span>
              ))}
              {DAY_NAMES_SHORT.map((day, i) => (
                <span key={`short-${i}`} className="sm:hidden">{day}</span>
              ))}
            </div>
            
            {/* Calendar days grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayTasks = tasksByDate[key] || [];
                const isSelected = isSameDay(day, selectedDate);
                const outsideMonth = !isSameMonth(day, currentMonth);
                const hasTask = dayTasks.length > 0;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectDate(day)}
                    className={cn(
                      // Responsive height and padding
                      "relative flex flex-col rounded-lg sm:rounded-xl border p-1 sm:p-2 text-left transition-all",
                      "h-12 sm:h-16 lg:h-20",
                      outsideMonth && "text-muted-foreground/50 bg-muted/20",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/80 hover:bg-muted/40",
                    )}
                    aria-label={`Select ${format(day, "MMMM d, yyyy")}`}
                    aria-pressed={isSelected}
                  >
                    {/* Date number and Today indicator */}
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs sm:text-sm font-semibold leading-none",
                        isToday(day) && "text-primary"
                      )}>
                        {format(day, "d")}
                      </span>
                      {isToday(day) && (
                        <span className="hidden sm:inline text-[10px] font-medium text-primary">Today</span>
                      )}
                    </div>

                    {/* Task indicator - simplified on mobile */}
                    {hasTask && (
                      <>
                        {/* Mobile: just a dot */}
                        <span className="sm:hidden absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                        {/* Desktop: task count badge */}
                        <div className="hidden sm:flex mt-auto">
                          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-primary">
                            {dayTasks.length}
                          </span>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const getCalendarGrid = (currentMonth: Date) => {
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

