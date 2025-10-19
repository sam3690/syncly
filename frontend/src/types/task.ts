export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}
