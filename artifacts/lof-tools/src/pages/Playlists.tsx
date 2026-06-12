import { useQuery } from "@tanstack/react-query";
import { Youtube, ExternalLink, PlaySquare, AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Video {
  title: string;
  video_url: string;
  published_at?: string;
  thumbnail?: string;
}

interface Playlist {
  playlist_title: string;
  playlist_url: string;
  updated: string;
  videos_count: number;
  videos: Video[];
}

interface RegionEntry {
  region: string;
  channel_url: string;
  playlists_updated: number;
  playlists: Playlist[];
}

interface ApiResponse {
  status: string;
  fetched_at: string;
  total_regions_active: number;
  total_playlists_updated: number;
  total_new_videos: number;
  data: RegionEntry[];
}

export function Playlists() {
  const { data, isLoading, isError, error } = useQuery<ApiResponse>({
    queryKey: ["youtube-playlists"],
    queryFn: async () => {
      const res = await fetch("/api/proxy/playlists");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      return res.json();
    },
    retry: 1,
  });

  const regions: RegionEntry[] = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Youtube className="w-8 h-8 text-red-500 shrink-0" />
        <div>
          <h2 className="text-2xl font-display uppercase tracking-widest leading-none">FF Playlist Network</h2>
          {data && (
            <p className="font-mono text-xs text-muted-foreground mt-1">
              {data.total_regions_active} regions &bull; {data.total_playlists_updated} playlists &bull; fetched {data.fetched_at?.slice(0, 10)}
            </p>
          )}
        </div>
      </div>

      {isError && (
        <div className="p-6 neon-border-primary bg-destructive/10 text-destructive flex items-start gap-4">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display uppercase text-lg mb-1">Signal Lost</h3>
            <p className="font-mono text-sm">Could not retrieve playlist network data.</p>
            <p className="font-mono text-xs opacity-70 mt-2">{(error as Error)?.message}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48 bg-muted" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="bg-card border border-border p-4 space-y-3">
                    <Skeleton className="w-full aspect-video bg-muted" />
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {regions.map((entry) => (
            <div key={entry.region}>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-primary shrink-0" />
                <h3 className="text-lg font-display uppercase tracking-widest text-primary neon-text-primary">
                  {entry.region}
                </h3>
                <a
                  href={entry.channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto font-mono text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                >
                  Channel <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {entry.playlists.length === 0 ? (
                <p className="font-mono text-sm text-muted-foreground px-2">No playlists available for this region.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entry.playlists.map((pl, pIdx) => (
                    <div
                      key={pIdx}
                      className="group border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors duration-300 flex flex-col"
                    >
                      {pl.videos.length > 0 && pl.videos[0].thumbnail ? (
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={pl.videos[0].thumbnail}
                            alt={pl.playlist_title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                          {pl.videos_count > 0 && (
                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 font-mono text-xs text-primary border border-primary/30">
                              {pl.videos_count} videos
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative aspect-video bg-muted/30 flex items-center justify-center border-b border-border">
                          <PlaySquare className="w-12 h-12 text-muted-foreground/20" />
                          {pl.videos_count > 0 && (
                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 font-mono text-xs text-primary border border-primary/30">
                              {pl.videos_count} videos
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-4 flex flex-col flex-grow">
                        <h4 className="font-display font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors uppercase tracking-wide">
                          {pl.playlist_title}
                        </h4>
                        <p className="font-mono text-xs text-muted-foreground mb-4">{pl.updated}</p>

                        {pl.videos.length > 0 && (
                          <div className="mb-4 space-y-1">
                            {pl.videos.slice(0, 3).map((v, vIdx) => (
                              <a
                                key={vIdx}
                                href={v.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors truncate"
                              >
                                <PlaySquare className="w-3 h-3 shrink-0 text-primary/50" />
                                <span className="truncate">{v.title}</span>
                              </a>
                            ))}
                            {pl.videos.length > 3 && (
                              <p className="text-xs font-mono text-muted-foreground/50 pl-5">
                                +{pl.videos.length - 3} more
                              </p>
                            )}
                          </div>
                        )}

                        <Button
                          variant="outline"
                          className="w-full mt-auto font-mono uppercase text-xs tracking-widest border-border hover:border-primary hover:text-primary bg-background/50 hover:bg-primary/10"
                          asChild
                        >
                          <a href={pl.playlist_url} target="_blank" rel="noopener noreferrer">
                            Open Playlist
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {regions.length === 0 && !isError && (
            <div className="py-12 text-center text-muted-foreground font-mono">
              NO PLAYLIST DATA AVAILABLE.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
