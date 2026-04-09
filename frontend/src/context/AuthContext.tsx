import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import Role from "../types/Rol";
type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  userRole: Role;
  setAuthToken: (token: string | null) => void;
};

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

type AuthProviderProps = {
  children?: ReactNode;
};

type DecodedToken = {
  rol_nombre: Role;
  exp: number;
  iat: number;
  sub: string;
};

export function AuthProvider({
  children,
}: Readonly<AuthProviderProps>) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const isAuthenticated = useMemo(() => !!token, [token]);

  const userRole = useMemo<Role>(() => {
    if (!token) return null;
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded?.rol_nombre;
  }, [token]);

  const setAuthToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }
  };

  const value: AuthContextValue = useMemo(() => {
    return {
      token,
      isAuthenticated,
      userRole,
      setAuthToken,
    };
  }, [token, isAuthenticated, userRole]);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
