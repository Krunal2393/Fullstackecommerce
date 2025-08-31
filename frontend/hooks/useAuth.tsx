"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";

// ✅ User interface
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// ✅ Auth context shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => void;
}

// ✅ Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: () => {},
});

// ✅ AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<{ user: User }>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        { withCredentials: true }
      );
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get<{ user: User }>(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          { withCredentials: true }
        );
        if (isMounted) setUser(res.data.user);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook to use auth
export const useAuth = () => useContext(AuthContext);
