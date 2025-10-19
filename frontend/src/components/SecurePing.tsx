import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function SecurePing() {
  const [out, setOut] = useState<string>("");
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();

  const call = async () => {
    try {
      if (!isAuthenticated) {
        await loginWithRedirect();
        return;
      }
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/secure/ping`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOut(`${res.status} ${await res.text()}`);
    } catch (e: unknown) {
      // Narrow unknown to Error when possible, otherwise stringify
      const msg = e instanceof Error ? e.message : String(e);
      setOut(`ERROR: ${msg}`);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={call}
        className="text-sm px-3 py-1.5 rounded-md border hover:bg-accent"
      >
        Secure Ping
      </button>
      <code className="text-xs opacity-80">{out}</code>
    </div>
  );
}
