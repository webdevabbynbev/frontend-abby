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

  /**
   * ✅ HttpOnly cookie mode:
   * - token tidak disimpan di FE
   * - login cukup set user
   */
  const login = ({ user }) => {
    setUser(user || null);
  };

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser(); // backend clear cookie
      clearSession();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [clearSession]);

  const didLoadRef = useRef(false);
  // hydrate from backend via HttpOnly cookie
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    let isMounted = true;

    const loadUser = async () => {
      try {
        const { user } = await getUser();

        if (!user) return; // belum login → DIAM

        if (isMounted) {
          setUser(user);
        }
      } catch (err) {
        // 🚨 hanya masuk sini kalau session EXPIRED
        clearSession();
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
