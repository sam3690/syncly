import { Auth0Provider } from "@auth0/auth0-react";

type Props = { children: React.ReactNode };

export default function AuthProvider({ children }: Props) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;

  if (!domain || !clientId) {
    console.warn("Auth0 env vars missing; Auth will be disabled");
    return <>{children}</>;
  }

  const redirectUri = window.location.origin; // handles 5173 and 8080

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE || undefined,
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
