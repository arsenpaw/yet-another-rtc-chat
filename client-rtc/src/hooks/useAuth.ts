import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.ts";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;
  username: string | undefined;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
