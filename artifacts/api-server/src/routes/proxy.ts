import { Router } from "express";

const router = Router();

async function proxyFetch(url: string, res: any, req: any) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({ error: `Upstream returned ${response.status}` });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    req.log.error({ err }, "Proxy fetch failed");
    res.status(502).json({ error: "Failed to reach upstream API", detail: err?.message });
  }
}

router.get("/proxy/splash", async (req, res) => {
  const region = (req.query.region as string) || "SG";
  await proxyFetch(`https://x-ff.vercel.app/event?region=${region}&key=SHAHG`, res, req);
});

router.get("/proxy/live-assets", async (req, res) => {
  const region = (req.query.region as string) || "SG";
  await proxyFetch(`https://api-links1.vercel.app/api?server=${region}`, res, req);
});

router.get("/proxy/store-assets", async (req, res) => {
  const region = (req.query.region as string) || "SG";
  await proxyFetch(`https://api-links2.vercel.app/api?server=${region}`, res, req);
});

router.get("/proxy/playlists", async (req, res) => {
  await proxyFetch("https://macxffplaylist.vercel.app/api/info", res, req);
});

export default router;
