import { useState } from "react";
import { Lock, Unlock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordGateProps {
  onUnlock: (password: string) => boolean;
  children: React.ReactNode;
  isUnlocked: boolean;
}

export function PasswordGate({ onUnlock, children, isUnlocked }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(password);
    if (!success) {
      setError(true);
      setPassword("");
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="w-full flex items-center justify-center min-h-[50vh] p-4">
      <div className="max-w-md w-full neon-border-primary bg-card/80 backdrop-blur p-8 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
        
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 neon-border-primary">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-display text-foreground mb-2 text-center uppercase tracking-widest">Restricted Area</h2>
        <p className="text-muted-foreground text-center mb-8 font-mono">Authorization required to access protected assets.</p>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="ENTER CLEARANCE CODE..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`font-mono uppercase bg-background/50 border-primary/30 focus-visible:ring-primary ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm font-mono mt-2">
                <AlertTriangle className="w-4 h-4" />
                <span>ACCESS DENIED. INVALID CODE.</span>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full font-display uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 neon-border-primary hover:shadow-[0_0_15px_hsl(var(--primary)_/_0.5)] transition-all duration-300"
          >
            <Unlock className="w-4 h-4 mr-2" />
            Authenticate
          </Button>
        </form>
      </div>
    </div>
  );
}
