import { create } from "zustand";
import api from "@/lib/api";
import { AxiosError } from "axios";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      token,
      user,
      isAuthenticated: !!token && !!user,
    };
  } catch {
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  }
};

const storedAuth = getStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: storedAuth.user,
  token: storedAuth.token,
  isAuthenticated: storedAuth.isAuthenticated,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, data } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data));

      set({
        token,
        user: data,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      let errorMessage = "Failed to log in. Please check your credentials.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      set({
        loading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage, { cause: err });
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/auth/register", { name, email, password, role });
      const { token, data } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data));

      set({
        token,
        user: data,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      let errorMessage = "Failed to create an account. Please try again.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      set({
        loading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage, { cause: err });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
