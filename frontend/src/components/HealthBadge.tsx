// frontend/src/components/HealthBadge.tsx
import { cn } from "@/lib/utils";
import { useHealth } from "@/hooks/useHealth";

export default function HealthBadge() {
  const { data, isLoading, isError } = useHealth();

  const status =
    isLoading ? "loading" : isError ? "down" : data?.status === "ok" ? "ok" : "warn";

  const dotClass = cn(
    "inline-block h-2.5 w-2.5 rounded-full mr-2",
    status === "ok" && "bg-green-500",
    status === "loading" && "bg-yellow-400 animate-pulse",
    status === "down" && "bg-red-500",
    status === "warn" && "bg-amber-500"
  );

  const label =
    status === "ok" ? "API: OK" :
    status === "loading" ? "API: …" :
    status === "down" ? "API: DOWN" : "API: WARN";

  return (
    <div className="text-xs text-muted-foreground flex items-center select-none">
      <span className={dotClass} />
      <span>{label}</span>
    </div>
  );
}
