import { useQuery } from "@tanstack/react-query";
import { Youtube, ExternalLink, PlaySquare, AlertCircle, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Playlists() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["youtube-playlists"],
    queryFn: async () => {
      const res = await fetch("https://macxffplaylist.vercel.app/api/info");
      if (!res.ok) throw new Error("Failed to fetch playlists");
      return res.json();
    },
    retry: 1,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Youtube className="w-8 h-8 text-red-600" />
        <h2 className="text-2xl font-display uppercase tracking-widest">Network Transmissions</h2>
      </div>

      {isError && (
        <div className="p-6 neon-border-primary bg-destructive/10 text-destructive flex items-start gap-4">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display uppercase text-lg mb-1">Signal Lost</h3>
            <p className="font-mono text-sm">Could not retrieve video network data.</p>
            <p className="font-mono text-xs opacity-70 mt-2">{error?.message}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border p-4 flex flex-col gap-4">
              <Skeleton className="w-full aspect-video bg-muted" />
              <Skeleton className="h-6 w-3/4 bg-muted" />
              <Skeleton className="h-4 w-1/2 bg-muted" />
              <div className="flex justify-between mt-auto pt-4">
                <Skeleton className="h-8 w-24 bg-muted" />
                <Skeleton className="h-8 w-24 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Handle whatever data structure comes back */}
          {Array.isArray(data) ? (
            data.map((item: any, idx: number) => (
              <PlaylistCard key={idx} item={item} />
            ))
          ) : data && typeof data === 'object' ? (
            // If it's an object containing arrays, render all arrays
            Object.entries(data).map(([key, val]) => {
              if (Array.isArray(val)) {
                return val.map((item: any, idx: number) => (
                  <PlaylistCard key={`${key}-${idx}`} item={item} category={key} />
                ));
              }
              // If it's a single object, render it
              if (typeof val === 'object' && val !== null) {
                 return <PlaylistCard key={key} item={val} category={key} />;
              }
              return null;
            })
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground font-mono">
              NO TRANSMISSION DATA AVAILABLE.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlaylistCard({ item, category }: { item: any, category?: string }) {
  // Try to extract useful info from unknown payload shape
  const title = item.title || item.name || item.snippet?.title || "Unknown Transmission";
  const desc = item.description || item.snippet?.description || "";
  const thumbnail = item.thumbnail || item.thumbnails?.high?.url || item.snippet?.thumbnails?.high?.url || item.image;
  const link = item.url || item.link || (item.id ? `https://youtube.com/watch?v=${item.id}` : null);
  
  const views = item.viewCount || item.statistics?.viewCount;
  const subs = item.subscriberCount || item.statistics?.subscriberCount;
  const vids = item.videoCount || item.statistics?.videoCount;

  return (
    <div className="group border border-border bg-card overflow-hidden hover:border-secondary transition-colors duration-300 flex flex-col relative">
      {category && (
        <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-1 text-[10px] font-mono uppercase text-secondary border border-secondary/30 backdrop-blur-md">
          {category}
        </div>
      )}
      
      {thumbnail ? (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
        </div>
      ) : (
        <div className="relative aspect-video bg-muted flex items-center justify-center">
          <PlaySquare className="w-12 h-12 text-muted-foreground/30" />
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-display font-bold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-secondary transition-colors">
          {title}
        </h3>
        
        {desc && (
          <p className="text-sm text-muted-foreground font-sans line-clamp-3 mb-4">
            {desc}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
          {views && (
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Eye className="w-3 h-3 text-secondary" />
              {Number(views).toLocaleString()}
            </div>
          )}
          {subs && (
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Users className="w-3 h-3 text-secondary" />
              {Number(subs).toLocaleString()}
            </div>
          )}
          {vids && (
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <PlaySquare className="w-3 h-3 text-secondary" />
              {Number(vids).toLocaleString()}
            </div>
          )}
        </div>
        
        {link && (
          <Button 
            variant="outline"
            className="w-full font-mono uppercase text-xs tracking-widest border-border hover:border-secondary hover:text-secondary bg-background/50 hover:bg-secondary/10"
            asChild
          >
            <a href={link} target="_blank" rel="noopener noreferrer">
              Open Uplink
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
