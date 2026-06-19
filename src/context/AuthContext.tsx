import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  current_streak: number;
  gym_name: string | null;
  location_lat: number | null;
  location_lon: number | null;
  settings: Record<string, any>;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (email: string, username: string, fullName: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: {
    full_name?: string;
    gym_name?: string;
    avatar_url?: string;
    location_lat?: number;
    location_lon?: number;
    settings?: Record<string, any>;
  }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  isRegisterOpen: boolean;
  setIsRegisterOpen: (open: boolean) => void;
  googleClientId: string;
  loginWithGoogle: (credential: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const GUEST_USER: User = {
  id: 0,
  email: "guest@strongape.com",
  username: "guest_ape",
  full_name: "Guest Ape",
  avatar_url: null,
  level: 1,
  xp: 0,
  current_streak: 0,
  gym_name: "StrongApe Gym",
  location_lat: null,
  location_lon: null,
  settings: {},
  created_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>("");

  const refreshProfile = async () => {
    try {
      const userData = await api.get<User>("/api/users/me");
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch current user profile:", error);
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // 1. Fetch Google Client ID from backend config
      try {
        const config = await api.get<{ google_client_id: string }>("/api/auth/config");
        if (config.google_client_id) {
          setGoogleClientId(config.google_client_id);
        }
      } catch (error) {
        console.error("Failed to load Google configuration:", error);
      }

      // 2. Load User Profile if token exists
      if (token) {
        await refreshProfile();
      } else {
        setUser(GUEST_USER);
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (usernameOrEmail: string, password: string) => {
    const data = await api.post<{ access_token: string; token_type: string }>("/api/auth/login", {
      username_or_email: usernameOrEmail,
      password,
    });
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const register = async (email: string, username: string, fullName: string, password: string) => {
    // 1. Register the user
    await api.post<User>("/api/auth/register", {
      email,
      username,
      full_name: fullName,
      password,
    });
    // 2. Automatically log in after registration
    await login(username, password);
  };

  const loginWithGoogle = async (credential: string) => {
    const data = await api.post<{ access_token: string; token_type: string }>("/api/auth/google", {
      credential,
    });
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(GUEST_USER);
  };

  const updateProfile = async (profileData: {
    full_name?: string;
    gym_name?: string;
    avatar_url?: string;
    location_lat?: number;
    location_lon?: number;
    settings?: Record<string, any>;
  }) => {
    const updatedUser = await api.patch<User>("/api/users/me/profile", profileData);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        isLoginOpen,
        setIsLoginOpen,
        isRegisterOpen,
        setIsRegisterOpen,
        googleClientId,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
