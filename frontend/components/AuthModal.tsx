import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

type User = {
  name: string;
  email: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================= SIGNUP =====================
  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIN =====================
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setUser(null);
  const clearError = () => setError(null);

  return {
    user,
    signup,
    login,
    logout,
    error,
    clearError,
    isLoading: loading,
  };
}
