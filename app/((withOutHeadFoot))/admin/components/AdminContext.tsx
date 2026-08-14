"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: number;
}

interface AdminContextType {
  admin: AdminUser | null;
  setAdmin: (admin: AdminUser | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  return (
    <AdminContext.Provider value={{ admin, setAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
