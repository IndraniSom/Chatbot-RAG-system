"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/hooks/useAuth";

/**
 * Wraps the entire app with React context providers. Kept in one place so
 * the root layout stays a server component (better streaming + smaller
 * client bundle).
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "10px",
            fontSize: "13px",
            padding: "10px 14px",
            boxShadow: "0 8px 24px rgba(10,10,11,0.10)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
    </AuthProvider>
  );
}