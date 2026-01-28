"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getUser, logoutUser } from "@/services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚩 flag untuk mencegah race condition OAuth
  const justLoggedInRef = useRef(false);

  /**
   * Login dari FE (OAuth / manual)
   */
  const login = ({ user }) => {
    justLoggedInRef.current = true;
    setUser(user || null);
  };

  const clearSession = useCallback(() => {
    justLoggedInRef.current = false;
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      clearSession();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [clearSession]);

  const didLoadRef = useRef(false);

  // hydrate dari backend via HttpOnly cookie
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    let isMounted = true;

    const loadUser = async () => {
      // ⛔ Jangan hydrate ulang tepat setelah OAuth login
      if (justLoggedInRef.current) {
        setLoading(false);
        return;
      }

      try {
        const { user } = await getUser();

        if (isMounted && user) {
          setUser(user);
        }
      } catch (err) {
        // ⛔ JANGAN clear user di sini
        console.warn("getUser failed, skip clearing session", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
