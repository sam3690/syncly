import { withAuthenticationRequired } from "@auth0/auth0-react";

export default function protect<P extends object>(Comp: React.ComponentType<P>) {
  return withAuthenticationRequired(Comp, {
    onRedirecting: () => (
      <div className="p-8 text-sm text-muted-foreground">Checking session…</div>
    ),
  });
}
