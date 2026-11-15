import { lazy, Suspense, useEffect } from "react";
import CookieConsent from "@/components/CookieConsent";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import IdeaPage from "./pages/IdeaPage";
import MyIdeas from "./pages/MyIdeas";
import PublicVerdict from "./pages/PublicVerdict";
import SampleReport from "./pages/SampleReport";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import { trackVisit } from "@/lib/analytics";

// The waitlist is its own page with its own styles; load it only when visited.
const Waitlist = lazy(() => import("./waitlist/Waitlist"));

const queryClient = new QueryClient();

/** Counts page views and scrolls to #anchors after client-side navigation. */
const RouteEffects = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    trackVisit();
  }, [pathname]);
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
    return () => clearTimeout(t);
  }, [pathname, hash]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="dark">
        <CookieConsent />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteEffects />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/idea/:id" element={<IdeaPage />} />
            <Route path="/ideas" element={<MyIdeas />} />
            <Route path="/r/:id" element={<PublicVerdict />} />
            <Route path="/sample" element={<SampleReport />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route
              path="/waitlist"
              element={
                <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
                  <Waitlist />
                </Suspense>
              }
            />
            {/* Old links from before the verdict-first beta */}
            {["/dashboard", "/onboarding", "/validate", "/boardroom", "/build-plan", "/launch-strategy"].map((path) => (
              <Route key={path} path={path} element={<Navigate to="/ideas" replace />} />
            ))}
            <Route path="/plans/:plan" element={<Navigate to="/#pricing" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
