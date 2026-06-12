import { useState, useEffect } from "react";

const SITE_PASSWORD = "2511";
const LS_KEY  = "lof-auth-ls";
const SS_KEY  = "lof-auth-ss";
const REMEMBER_MS = 24 * 60 * 60 * 1000;

function readAuth(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(SS_KEY) === "1") return true;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return false;
  try {
    const { expiry } = JSON.parse(raw) as { expiry: number };
    if (expiry > Date.now()) return true;
    localStorage.removeItem(LS_KEY);
  } catch { localStorage.removeItem(LS_KEY); }
  return false;
}

export function useSiteAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthenticated(readAuth());
    setLoading(false);
  }, []);

  const verify = async (password: string, rememberMe: boolean): Promise<boolean> => {
    let valid = false;

    if (password === SITE_PASSWORD) {
      valid = true;
    } else if (password.trim().length > 0) {
      try {
        const r = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: password.trim().toUpperCase() }),
        });
        const d = await r.json();
        valid = d.valid === true;
      } catch { /* network error */ }
    }

    if (valid) {
      if (rememberMe) {
        localStorage.setItem(LS_KEY, JSON.stringify({ expiry: Date.now() + REMEMBER_MS }));
      } else {
        sessionStorage.setItem(SS_KEY, "1");
      }
      setAuthenticated(true);
    }
    return valid;
  };

  const logout = () => {
    localStorage.removeItem(LS_KEY);
    sessionStorage.removeItem(SS_KEY);
    setAuthenticated(false);
  };

  return { authenticated, loading, verify, logout };
}
