import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Role from "../types/Rol";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  userRole: Role;
  setAuthToken: (token: string | null) => void;
  setAuthRefreshToken: (token: string | null) => void;
  refreshToken?: string | null;
  handleLogout?: () => void;
  checkAuthOnLoad?: () => void;
};

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

type AuthProviderProps = {
  children?: ReactNode;
};

export function AuthProvider({
  children,
}: Readonly<AuthProviderProps>) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token"),
  );
  const [refreshToken, setRefreshToken] = useState<
    string | null
  >(localStorage.getItem("refresh_token"));
  const isAuthenticated = useMemo(
    () => !!token || !!refreshToken,
    [token, refreshToken],
  );

  function checkAuthOnLoad() {
    if (!isAuthenticated) {
      globalThis.location.replace("/");
    }
  }

  const userRole = useMemo<Role>(() => {
    if (!token) return null;
    const role = localStorage.getItem("user_role");
    if (role) return role as Role;
    return null;
  }, [token]);

  const setAuthToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("access_token", newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem("access_token");
      setToken(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    setToken(null);
    setRefreshToken(null);
    globalThis.location.reload();
  };

  const setAuthRefreshToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("refresh_token", newToken);
      setRefreshToken(newToken);
    } else {
      localStorage.removeItem("refresh_token");
      setRefreshToken(null);
    }
  };

  const value: AuthContextValue = useMemo(() => {
    return {
      token,
      isAuthenticated,
      userRole,
      setAuthToken,
      setAuthRefreshToken,
      refreshToken,
      handleLogout,
      checkAuthOnLoad,
    };
  }, [token, isAuthenticated, userRole, refreshToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
