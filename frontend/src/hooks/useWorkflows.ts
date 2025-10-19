import { useQuery } from "@tanstack/react-query";
import { getWorkflows } from "@/api/workflows";
import type { Workflow } from "@/types/workflow";

export function useWorkflows() {
  return useQuery<Workflow[]>({
    queryKey: ["workflows"],
    queryFn: getWorkflows,
    staleTime: 60_000, // 1 minute cache
  });
}
