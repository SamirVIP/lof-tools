import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Download, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const REGIONS = ["SG", "BD", "IND", "CIS", "EU", "NA", "PK", "ID", "TH", "MEA", "BR", "LATAM", "VN", "TW"];

const SHARED_FILTERS = ["256x107"];
const REGION_FILTERS: Record<string, string[]> = {
  "SG": ["Tab", "1400x700", ...SHARED_FILTERS],
  "IND": ["Tab", "1400x700", ...SHARED_FILTERS],
  "BD": ["Tab", "1400x700", ...SHARED_FILTERS],
  "CIS": ["Tab", "1400x700", ...SHARED_FILTERS],
  "EU": ["Tab", "1400x700", ...SHARED_FILTERS],
  "NA": ["Tab", "1400x700", ...SHARED_FILTERS],
  "PK": ["Tab", "1400x700", ...SHARED_FILTERS],
  "ID": ["Tab", "1400x700", "Overview", ...SHARED_FILTERS],
  "VN": ["Tab", "1400x700"], // Excluded from shared
  "LATAM": ["Tab", "1400x700", ...SHARED_FILTERS],
  "BR": ["Tab", "1400x700", ...SHARED_FILTERS],
  "MEA": ["Tab", "1400x700", "BG", ...SHARED_FILTERS],
  "TW": ["180x80", "1400x700", ...SHARED_FILTERS],
  "TH": ["TabTH", "1400x700", ...SHARED_FILTERS],
};

export function LiveAssets() {
  const [region, setRegion] = useState(REGIONS[0]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["live-assets", region],
    queryFn: async () => {
      const res = await fetch(`https://api-links1.vercel.app/api?server=${region}`);
      if (!res.ok) throw new Error("Failed to fetch live assets");
      return res.json();
    },
    retry: 1,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "URL Copied!",
      description: "Asset URL copied to clipboard.",
      className: "neon-border-accent bg-card",
    });
  };

  const handleRegionChange = (r: string) => {
    setRegion(r);
    setActiveFilter("All");
  };

  const assets = useMemo(() => {
    if (!data) return [];
    
    // Convert object to array of { path, url }
    let items = Object.entries(data).map(([path, url]) => ({
      path,
      url: url as string
    })).filter(item => item.url && typeof item.url === 'string');

    if (activeFilter !== "All") {
      items = items.filter(item => item.path.toLowerCase().includes(activeFilter.toLowerCase()));
    }

    return items;
  }, [data, activeFilter]);

  const currentFilters = ["All", ...(REGION_FILTERS[region] || [])];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-display text-secondary uppercase tracking-widest neon-text-accent">Region Select</h2>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => handleRegionChange(r)}
              className={`px-4 py-2 font-mono text-sm uppercase transition-all duration-200 border ${
                region === r 
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-[0_0_10px_hsl(var(--secondary)_/_0.3)]" 
                  : "bg-card text-muted-foreground border-border hover:border-secondary/50 hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
        <div className="flex gap-2 shrink-0">
          {currentFilters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 font-mono text-xs uppercase rounded-none border transition-colors ${
                activeFilter === filter
                  ? "bg-secondary/20 text-secondary border-secondary"
                  : "bg-transparent text-muted-foreground border-border hover:border-secondary/50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="p-6 neon-border-primary bg-destructive/10 text-destructive flex items-start gap-4">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display uppercase text-lg mb-1">System Error</h3>
            <p className="font-mono text-sm">Failed to establish secure connection to asset server.</p>
            <p className="font-mono text-xs opacity-70 mt-2">{error?.message}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="neon-border-accent bg-card overflow-hidden">
              <Skeleton className="w-full h-32 bg-muted" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-2/3 bg-muted" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-full bg-muted" />
                  <Skeleton className="h-9 w-12 bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map((asset: any, idx: number) => (
            <div key={idx} className="group neon-border-accent bg-card overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="relative h-40 overflow-hidden bg-[#0a0a0c] flex items-center justify-center p-4">
                <img 
                  src={asset.url} 
                  alt="Asset Preview" 
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0NzU1NjkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSIyIi8+PHBhdGggZD0ibTIxIDE1LTMuMDgtNi4xNWEyIDIgMCAwIDAtMyAwbC01Ljg4IDExLjgzIi8+PC9zdmc+';
                    (e.target as HTMLImageElement).className = "w-8 h-8 opacity-20";
                  }}
                />
              </div>
              
              <div className="p-4 flex flex-col flex-grow border-t border-border group-hover:border-secondary/30 transition-colors">
                <div className="mb-4 font-mono text-xs text-muted-foreground break-all" title={asset.path}>
                  <span className="text-secondary/70 mr-2">PATH:</span>
                  {asset.path}
                </div>
                
                <div className="flex gap-2 mt-auto">
                  <Button 
                    onClick={() => copyToClipboard(asset.url)}
                    variant="outline"
                    className="flex-grow font-mono uppercase tracking-widest border-secondary/50 text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 border-secondary/50 text-secondary hover:bg-secondary hover:text-secondary-foreground"
                    asChild
                  >
                    <a href={asset.url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {assets.length === 0 && !isError && (
            <div className="col-span-full py-16 text-center flex flex-col items-center justify-center gap-4 neon-border-accent bg-card/30">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground font-mono uppercase">No assets match the current filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
