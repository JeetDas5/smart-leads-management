import { create } from "zustand";
import api from "@/lib/api";
import { AxiosError } from "axios";

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: string;
  source: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Stats {
  total?: number;
  new?: number;
  contacted?: number;
  qualified?: number;
  lost?: number;
  conversionRate?: number;
  
  overall?: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    lost: number;
    conversionRate: number;
  };
  salespersons?: {
    salesperson: {
      id: string;
      name: string;
      email: string;
    };
    stats: {
      total: number;
      new: number;
      contacted: number;
      qualified: number;
      lost: number;
      conversionRate: number;
    };
  }[];
}

export interface Salesperson {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface FetchLeadsParams {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  search?: string;
  sort?: string;
  createdBy?: string;
}

interface LeadState {
  leads: Lead[];
  pagination: Pagination;
  stats: Stats | null;
  salespersons: Salesperson[];
  currentLead: Lead | null;
  loading: boolean;
  error: string | null;
  fetchLeads: (params?: FetchLeadsParams) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchSalespersons: () => Promise<void>;
  createLead: (data: { name: string; email: string; status?: string; source: string }) => Promise<void>;
  updateLead: (id: string, data: { name: string; email: string; status: string; source: string }) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  setCurrentLead: (lead: Lead | null) => void;
  clearError: () => void;
}

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  stats: null,
  salespersons: [],
  currentLead: null,
  loading: false,
  error: null,

  fetchLeads: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/leads", { params });
      const { leads, pagination } = response.data.data;
      set({
        leads,
        pagination,
        loading: false,
      });
    } catch (err: unknown) {
      let errorMessage = "Failed to fetch leads.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      set({ loading: false, error: errorMessage });
    }
  },

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/leads/stats");
      set({
        stats: response.data.data,
        loading: false,
      });
    } catch (err: unknown) {
      let errorMessage = "Failed to fetch stats.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      set({ loading: false, error: errorMessage });
    }
  },

  fetchSalespersons: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/auth/salespersons");
      set({
        salespersons: response.data.data,
        loading: false,
      });
    } catch (err: unknown) {
      let errorMessage = "Failed to fetch salespersons.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      set({ loading: false, error: errorMessage });
    }
  },

  createLead: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/leads", data);
      set({ loading: false });
    } catch (err: unknown) {
      let errorMessage = "Failed to create lead.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage, { cause: err });
    }
  },

  updateLead: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/leads/${id}`, data);
      set({ loading: false });
    } catch (err: unknown) {
      let errorMessage = "Failed to update lead.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage, { cause: err });
    }
  },

  deleteLead: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/leads/${id}`);
      set({ loading: false });
    } catch (err: unknown) {
      let errorMessage = "Failed to delete lead.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage, { cause: err });
    }
  },

  setCurrentLead: (lead) => set({ currentLead: lead }),
  clearError: () => set({ error: null }),
}));
