import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();

  console.log("LoginButton render:", { isAuthenticated, isLoading, error });

  if (isLoading || isAuthenticated) return null;

  const handleLogin = () => {
    console.log("Login button clicked, calling loginWithRedirect");
    try {
      loginWithRedirect();
    } catch (error) {
      console.error("Error calling loginWithRedirect:", error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
    >
      Log in
    </button>
  );
}
