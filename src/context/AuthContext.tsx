"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ALUMNI" | "ADMIN";
  avatarUrl?: string | null;
  department?: string | null;
  alumniProfile?: any;
  studentProfile?: any;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "ALUMNI";
  department?: string;
  degree?: string;
  graduationYear?: number;
  careerGoals?: string;
  targetIndustries?: string[] | string;
  targetRoles?: string[] | string;
  skillsToDevelop?: string[] | string;
  currentCompany?: string;
  currentRole?: string;
  industry?: string;
  yearsOfExperience?: number;
  bio?: string;
  skills?: string[] | string;
  mentoringTopics?: string[] | string;
  maxMenteesCapacity?: number;
  availableHoursPerWeek?: number;
  preferredTimeSlots?: string[] | string;
  protectContactDetails?: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  availableUsers: any[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  availableUsers: [],
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  switchUser: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async (targetId?: string) => {
    try {
      setIsLoading(true);
      const url = targetId ? `/api/auth/current?userId=${targetId}` : `/api/auth/current`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.availableUsers) {
        setAvailableUsers(data.availableUsers);
      }

      if (data.currentUser) {
        setUser(data.currentUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch session", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || "Registration failed" };
      }

      setUser(json.user);
      await fetchSession(); // refresh available users list
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchUser = async (userId: string) => {
    await fetchSession(userId);
  };

  const refreshUser = async () => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        availableUsers,
        isLoading,
        login,
        register,
        logout,
        switchUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
