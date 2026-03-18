import {useEffect, useState, useCallback, type ReactNode} from "react";
import keycloak from "../lib/keycloak.ts";
import { AuthContext } from "../contexts/AuthContext.ts";


interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({
        onLoad: "login-required",
        checkLoginIframe: false,
        pkceMethod: "S256",
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Keycloak init failed", err);
        setIsLoading(false);
      });

    // Refresh token periodically
    const interval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak
          .updateToken(60) // refresh if token expires within 60s
          .catch(() => {
            console.warn("Token refresh failed, redirecting to login");
            keycloak.login();
          });
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(() => keycloak.login(), []);
  const logout = useCallback(
    () => keycloak.logout({ redirectUri: window.location.origin }),
    [],
  );

  const token = keycloak.token;
  const username = keycloak.tokenParsed?.preferred_username as
    | string
    | undefined;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, token, username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
