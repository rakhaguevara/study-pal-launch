import { useEffect } from "react";
import { Control, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addMinutes, format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CreateTaskPayload } from "@/types/tasks";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  isSubmitting?: boolean;
}

const taskFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    subject: z.string().optional(),
    description: z.string().optional(),
    startDate: z.date({ required_error: "Start date is required" }),
    startTime: z.string().min(1, "Start time is required"),
    endDate: z.date({ required_error: "Deadline date is required" }),
    endTime: z.string().min(1, "Deadline time is required"),
  })
  .refine(
    (values) => {
      const start = combineDateAndTime(values.startDate, values.startTime);
      const end = combineDateAndTime(values.endDate, values.endTime);
      return end.getTime() > start.getTime();
    },
    {
      message: "Deadline must be later than start time",
      path: ["endTime"],
    },
  );

type TaskFormValues = z.infer<typeof taskFormSchema>;

export const AddTaskDialog = ({ open, onOpenChange, selectedDate, onSubmit, isSubmitting }: AddTaskDialogProps) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: buildDefaultValues(selectedDate),
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaultValues(selectedDate));
    }
  }, [selectedDate, open, form]);

  const handleSubmit = async (values: TaskFormValues) => {
    const payload: CreateTaskPayload = {
      title: values.title,
      subject: values.subject?.trim() || undefined,
      description: values.description?.trim() || undefined,
      startTime: combineDateAndTime(values.startDate, values.startTime).toISOString(),
      endTime: combineDateAndTime(values.endDate, values.endTime).toISOString(),
    };

    await onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Responsive dialog: full width with margin on mobile */}
      <DialogContent className="max-h-[85vh] sm:max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full max-w-lg sm:max-w-xl mx-auto rounded-xl">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Add Task</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Plan your study session and keep it synced with Google Calendar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4 sm:space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Task title</FormLabel>
                  <FormControl>
                    <Input placeholder="Midterm revision session" className="text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Subject (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Physics, Calculus, ..." className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-sm">Description</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Add notes, study goals, or resources." className="text-sm resize-none" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <DatePickerField label="Start date" name="startDate" control={form.control} />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Start time</FormLabel>
                    <FormControl>
                      <Input type="time" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <DatePickerField label="Deadline date" name="endDate" control={form.control} />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Deadline time</FormLabel>
                    <FormControl>
                      <Input type="time" className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:gap-3 sm:flex-row pt-2 sm:pt-4">
              <Button type="button" variant="outline" className="w-full sm:w-auto text-sm h-9 sm:h-10" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto text-sm h-9 sm:h-10" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const DatePickerField = ({
  label,
  name,
  control,
}: {
  label: string;
  name: "startDate" | "endDate";
  control: Control<TaskFormValues>;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel className="text-sm">{label}</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal text-sm h-9 sm:h-10",
                  !field.value && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">
                  {field.value ? format(field.value, "PP") : "Pick a date"}
                </span>
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" side="bottom">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={(newDate) => newDate && field.onChange(newDate)}
              initialFocus
              className="text-sm"
            />
          </PopoverContent>
        </Popover>
        <FormMessage className="text-xs" />
      </FormItem>
    )}
  />
);

const buildDefaultValues = (date: Date): TaskFormValues => {
  const startTime = format(date, "HH:mm");
  const endTime = format(addMinutes(date, 60), "HH:mm");

  return {
    title: "",
    subject: "",
    description: "",
    startDate: new Date(date),
    startTime,
    endDate: new Date(date),
    endTime,
  };
};

const combineDateAndTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const merged = new Date(date);
  merged.setHours(hours ?? 0);
  merged.setMinutes(minutes ?? 0);
  merged.setSeconds(0, 0);
  return merged;
};

