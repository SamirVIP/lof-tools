import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Lock, ShieldCheck, TerminalSquare } from "lucide-react";
import NotFound from "@/pages/not-found";

import { useAuth } from "@/hooks/use-auth";
import { PasswordGate } from "@/components/auth/PasswordGate";
import { SplashBanners } from "@/pages/SplashBanners";
import { LiveAssets } from "@/pages/LiveAssets";
import { StoreAssets } from "@/pages/StoreAssets";
import { Playlists } from "@/pages/Playlists";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppLayout() {
  const [activeTab, setActiveTab] = useState<"splash" | "live" | "store" | "playlists">("splash");
  const { isUnlocked, unlock } = useAuth();

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Global scanline effect */}
      <div className="scanline-overlay pointer-events-none" />

      {/* Header / Nav */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
            
            {/* Logo */}
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

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <NavTab 
                label="Splash Banners" 
                isActive={activeTab === "splash"} 
                onClick={() => setActiveTab("splash")} 
              />
              <NavTab 
                label="Live Assets" 
                isActive={activeTab === "live"} 
                onClick={() => setActiveTab("live")} 
                isProtected 
                isUnlocked={isUnlocked}
              />
              <NavTab 
                label="Store Assets" 
                isActive={activeTab === "store"} 
                onClick={() => setActiveTab("store")} 
                isProtected 
                isUnlocked={isUnlocked}
              />
              <NavTab 
                label="FF Playlists" 
                isActive={activeTab === "playlists"} 
                onClick={() => setActiveTab("playlists")} 
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "splash" && <SplashBanners />}
          
          {activeTab === "live" && (
            <PasswordGate isUnlocked={isUnlocked} onUnlock={unlock}>
              <LiveAssets />
            </PasswordGate>
          )}
          
          {activeTab === "store" && (
            <PasswordGate isUnlocked={isUnlocked} onUnlock={unlock}>
              <StoreAssets />
            </PasswordGate>
          )}
          
          {activeTab === "playlists" && <Playlists />}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-4 mt-auto relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-muted-foreground">
          <p>SYSTEM ONLINE. SECURE CONNECTION ESTABLISHED.</p>
          <p className="opacity-50">V 2.4.1 // GARENA FREE FIRE // RESTRICTED ACCESS</p>
        </div>
      </footer>
    </div>
  );
}

function NavTab({ 
  label, 
  isActive, 
  onClick, 
  isProtected = false,
  isUnlocked = false
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  isProtected?: boolean;
  isUnlocked?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 font-display uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap
        ${isActive 
          ? "text-primary bg-primary/10 border-b-2 border-primary" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-b-2 border-transparent"
        }
      `}
    >
      {label}
      {isProtected && (
        <span className="inline-flex">
          {isUnlocked ? (
            <ShieldCheck className="w-3 h-3 text-secondary opacity-70" />
          ) : (
            <Lock className="w-3 h-3 text-destructive opacity-70" />
          )}
        </span>
      )}
    </button>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
