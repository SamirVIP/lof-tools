import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TerminalSquare, Settings, LogOut } from "lucide-react";
import NotFound from "@/pages/not-found";

import { useSiteAuth } from "@/hooks/use-site-auth";
import { SiteGate } from "@/components/auth/SiteGate";
import { SplashBanners } from "@/pages/SplashBanners";
import { LiveAssets } from "@/pages/LiveAssets";
import { StoreAssets } from "@/pages/StoreAssets";
import { Playlists } from "@/pages/Playlists";
import { AdminPage } from "@/pages/AdminPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
  },
});

type Tab = "splash" | "live" | "store" | "playlists";

function AppLayout({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("splash");
  const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) {
    return <AdminPage onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground relative overflow-hidden flex flex-col">
      <div className="scanline-overlay pointer-events-none" />

      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center animate-pulse shadow-[0_0_15px_hsl(var(--primary)_/_0.5)]">
                <TerminalSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold uppercase tracking-[0.2em] neon-text-primary m-0 leading-none">
                  LOF TOOLS
                </h1>
                <p className="text-[10px] font-mono text-primary/70 tracking-widest mt-1">TACTICAL ASSET COMMAND</p>
              </div>
            </div>

            <nav className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {(["splash", "live", "store", "playlists"] as Tab[]).map((tab) => {
                const labels: Record<Tab, string> = {
                  splash: "Splash Banners",
                  live: "Live Assets",
                  store: "Store Assets",
                  playlists: "FF Playlists",
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 py-2 font-display uppercase tracking-widest text-sm transition-all duration-300 whitespace-nowrap border-b-2 ${
                      activeTab === tab
                        ? "text-primary bg-primary/10 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-transparent"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 ml-auto md:ml-0">
              <button
                onClick={() => setShowAdmin(true)}
                title="Admin Panel"
                className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" key={activeTab}>
          {activeTab === "splash"    && <SplashBanners />}
          {activeTab === "live"      && <LiveAssets />}
          {activeTab === "store"     && <StoreAssets />}
          {activeTab === "playlists" && <Playlists />}
        </div>
      </main>

      <footer className="border-t border-border bg-card/50 py-4 mt-auto relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-muted-foreground">
          <p>SYSTEM ONLINE. SECURE CONNECTION ESTABLISHED.</p>
          <p className="opacity-50">V 1.01 // @LEAKS OF FF // RESTRICTED ACCESS</p>
        </div>
      </footer>
    </div>
  );
}

function AuthenticatedApp() {
  const { authenticated, loading, verify, logout } = useSiteAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-primary animate-pulse tracking-widest uppercase">Initializing...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <SiteGate onVerify={verify} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <AppLayout onLogout={logout} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthenticatedApp />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
