import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppAccess } from "@/lib/access";

/** Shows its children only to approved users; everyone else goes to the waitlist. */
export const RequireAccess = ({ children }: { children: ReactNode }) => {
  const access = useAppAccess();
  if (access === "loading") return <div className="min-h-screen bg-background" />;
  if (access === "signed_out") return <Navigate to="/waitlist" replace />;
  if (access === "pending") return <Navigate to="/waitlist?pending=1" replace />;
  return <>{children}</>;
};
