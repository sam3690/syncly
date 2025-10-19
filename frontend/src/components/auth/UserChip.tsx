import { useAuth0 } from "@auth0/auth0-react";

export default function UserChip() {
  const { user, isAuthenticated } = useAuth0();
  if (!isAuthenticated) return null;
  const name = user?.name || user?.email || "User";
  return (
    <div className="text-xs text-muted-foreground">
      {name}
    </div>
  );
}
