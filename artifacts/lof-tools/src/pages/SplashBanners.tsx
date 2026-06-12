import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Clock, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const REGIONS = ["SG", "BD", "IND", "CIS", "EU", "NA", "PK", "ID", "TH", "ME", "BR", "LATAM", "VN", "TW"];

export function SplashBanners() {
  const [region, setRegion] = useState(REGIONS[0]);
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["splash-banners", region],
    queryFn: async () => {
      const res = await fetch(`https://x-ff.vercel.app/event?region=${region}&key=SHAHG`);
      if (!res.ok) throw new Error("Failed to fetch splash banners");
      return res.json();
    },
    retry: 1,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "URL Copied!",
      description: "Image URL copied to clipboard.",
      className: "neon-border-primary bg-card",
    });
  };

  const banners = data ? Object.values(data).filter((item: any) => item && item.url) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-display text-primary uppercase tracking-widest neon-text-primary">Region Select</h2>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-4 py-2 font-mono text-sm uppercase transition-all duration-200 border ${
                region === r 
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_hsl(var(--primary)_/_0.3)]" 
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="p-6 neon-border-accent bg-destructive/10 text-destructive flex items-start gap-4">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display uppercase text-lg mb-1">Connection Error</h3>
            <p className="font-mono text-sm">CORS Error — try a different browser or enable CORS. Alternatively, the API might be down.</p>
            <p className="font-mono text-xs opacity-70 mt-2">{error?.message}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="neon-border-primary bg-card overflow-hidden">
              <Skeleton className="w-full h-48 bg-muted" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
                <Skeleton className="h-10 w-full bg-muted mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {banners.map((banner: any, idx: number) => (
            <div key={idx} className="group neon-border-primary bg-card overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)_/_0.3)]">
              <div className="relative aspect-video overflow-hidden bg-muted/20">
                <img 
                  src={banner.url} 
                  alt={banner.title || "Splash Banner"} 
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-display font-bold text-lg mb-4 line-clamp-2" title={banner.title}>
                  {banner.title || "UNTITLED ASSET"}
                </h3>
                
                <div className="space-y-2 mb-6 mt-auto">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="truncate">Start: {banner.startTime || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="truncate">End: {banner.endTime || "N/A"}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => copyToClipboard(banner.url)}
                  variant="outline"
                  className="w-full font-mono uppercase tracking-widest border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors group-hover:border-primary"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
              </div>
            </div>
          ))}
          
          {banners.length === 0 && !isError && (
            <div className="col-span-full py-12 text-center text-muted-foreground font-mono neon-border-primary bg-card/50">
              NO SPLASH BANNERS FOUND FOR THIS REGION.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
