import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  if (isLoading || isAuthenticated) return null;
  return (
    <button
      onClick={() => loginWithRedirect()}
      className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
    >
      Log in
    </button>
  );
}
