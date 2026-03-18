import {createContext} from "react";
import type {AuthContextType} from "../hooks/useAuth.ts";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
