export type TaskSource = "google" | "manual";

export interface Task {
  id: string;
  title: string;
  subject?: string | null;
  description?: string | null;
  startTime: string;
  endTime: string;
  source: TaskSource;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  subject?: string;
  description?: string | null;
  startTime: string;
  endTime: string;
}

