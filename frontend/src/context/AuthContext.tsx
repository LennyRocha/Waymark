import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Role from "../types/Rol";
import useSetUserImage from "../utils/useSetUserImage";

export type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  userRole: Role;
  userImage?: string | null;
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
  useSetUserImage();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token"),
  );
  const [refreshToken, setRefreshToken] = useState<
    string | null
  >(localStorage.getItem("refresh_token"));
  const isAuthenticated = !!token;

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
    globalThis.location.replace("/");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_image");
    setToken(null);
    setRefreshToken(null);
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

  const userImage = localStorage.getItem("user_image");

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
      userImage,
    };
  }, [
    token,
    isAuthenticated,
    userRole,
    refreshToken,
    userImage,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
