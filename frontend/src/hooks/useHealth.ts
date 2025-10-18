import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

type Health = { status: "ok" | string; service?: string };

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => api.get<Health>("/health"),
    // Poll occasionally so the badge reflects restarts
    refetchInterval: 20_000,
  });
}
