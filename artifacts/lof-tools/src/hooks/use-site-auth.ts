import { useState, useEffect, useCallback } from "react";

const SITE_PASSWORD = "2511";
const LS_KEY  = "lof-auth-ls";
const SS_KEY  = "lof-auth-ss";
const REMEMBER_MS = 24 * 60 * 60 * 1000;

interface StoredAuth {
  expiry: number;
  isOtp: boolean;
  otpExpiry?: number;
}

function readStored(): { ok: boolean; expiredOtp: boolean; otpExpiry: number | null } {
  if (typeof window === "undefined") return { ok: false, expiredOtp: false, otpExpiry: null };
  if (sessionStorage.getItem(SS_KEY) === "1") return { ok: true, expiredOtp: false, otpExpiry: null };
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return { ok: false, expiredOtp: false, otpExpiry: null };
  try {
    const data = JSON.parse(raw) as StoredAuth;
    if (data.expiry > Date.now()) {
      return { ok: true, expiredOtp: false, otpExpiry: data.otpExpiry ?? null };
    }
    const wasOtp = data.isOtp ?? false;
    localStorage.removeItem(LS_KEY);
    return { ok: false, expiredOtp: wasOtp, otpExpiry: data.otpExpiry ?? null };
  } catch {
    localStorage.removeItem(LS_KEY);
    return { ok: false, expiredOtp: false, otpExpiry: null };
  }
}

export function useSiteAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [otpExpiry, setOtpExpiry]         = useState<number | null>(null);

  useEffect(() => {
    const { ok, expiredOtp, otpExpiry: exp } = readStored();
    setAuthenticated(ok);
    if (ok && exp) setOtpExpiry(exp);
    if (!ok && expiredOtp) setSessionExpired(true);
    setLoading(false);
  }, []);

  const verify = async (
    password: string,
    rememberMe: boolean,
  ): Promise<boolean> => {
    let valid = false;
    let isOtp = false;
    let otpExp: number | null = null;

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
        if (d.valid) {
          valid  = true;
          isOtp  = true;
          otpExp = d.expiresAt ? new Date(d.expiresAt).getTime() : null;
        }
      } catch { /* network error */ }
    }

    if (valid) {
      setSessionExpired(false);
      if (isOtp && otpExp) {
        const stored: StoredAuth = { expiry: otpExp, isOtp: true, otpExpiry: otpExp };
        localStorage.setItem(LS_KEY, JSON.stringify(stored));
        setOtpExpiry(otpExp);
      } else if (rememberMe) {
        const stored: StoredAuth = { expiry: Date.now() + REMEMBER_MS, isOtp: false };
        localStorage.setItem(LS_KEY, JSON.stringify(stored));
        setOtpExpiry(null);
      } else {
        sessionStorage.setItem(SS_KEY, "1");
        setOtpExpiry(null);
      }
      setAuthenticated(true);
    }
    return valid;
  };

  const logout = useCallback((timedOut = false) => {
    localStorage.removeItem(LS_KEY);
    sessionStorage.removeItem(SS_KEY);
    setAuthenticated(false);
    setOtpExpiry(null);
    if (timedOut) setSessionExpired(true);
  }, []);

  return { authenticated, loading, verify, logout, sessionExpired, otpExpiry };
}
