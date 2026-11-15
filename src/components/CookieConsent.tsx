import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("vex-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("vex-cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("vex-cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-in slide-in-from-bottom-5 duration-500">
      <div className="rounded-xl border border-border bg-card p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3 mb-4">
          <Cookie className="h-5 w-5 text-purple shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            We use your browser's storage to keep you signed in, remember your results and count visits anonymously. See our{" "}
            <a href="/privacy" className="text-purple hover:underline">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" className="h-11" onClick={decline}>
            Essential only
          </Button>
          <Button className="h-11" onClick={accept}>
            Allow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
