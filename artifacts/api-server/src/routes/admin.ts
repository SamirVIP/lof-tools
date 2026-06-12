import { Router } from "express";
import { db, otpsTable } from "@workspace/db";
import { eq, gt } from "drizzle-orm";
import { randomBytes } from "crypto";

const ADMIN_PASSWORD = "2511";
const router = Router();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const VALIDITY_MAP: Record<string, { ms: number; label: string }> = {
  "10min": { ms: 10 * 60 * 1000,            label: "10 Minutes" },
  "1hr":   { ms: 60 * 60 * 1000,            label: "1 Hour"     },
  "6hr":   { ms: 6 * 60 * 60 * 1000,        label: "6 Hours"    },
  "30d":   { ms: 30 * 24 * 60 * 60 * 1000,  label: "30 Days"    },
  "90d":   { ms: 90 * 24 * 60 * 60 * 1000,  label: "90 Days"    },
  "365d":  { ms: 365 * 24 * 60 * 60 * 1000, label: "365 Days"   },
};

router.post("/admin/otp/generate", async (req, res) => {
  if (req.body?.adminPassword !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { ms, label } = VALIDITY_MAP[req.body?.validity ?? "1hr"] ?? VALIDITY_MAP["1hr"];
  const code = generateCode();
  const id = randomBytes(8).toString("hex");
  const expiresAt = new Date(Date.now() + ms);
  await db.insert(otpsTable).values({ id, code, expiresAt, validityLabel: label });
  res.json({ otp: { id, code, expiresAt, validityLabel: label } });
});

router.get("/admin/otp/list", async (req, res) => {
  if (req.query.adminPassword !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const otps = await db.select().from(otpsTable).where(gt(otpsTable.expiresAt, new Date()));
  res.json({ otps });
});

router.delete("/admin/otp/:id", async (req, res) => {
  if (req.body?.adminPassword !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await db.delete(otpsTable).where(eq(otpsTable.id, req.params.id));
  res.json({ success: true });
});

router.post("/auth/verify-otp", async (req, res) => {
  const code = (req.body?.code ?? "").toUpperCase();
  if (!code) { res.json({ valid: false }); return; }
  const rows = await db.select().from(otpsTable)
    .where(eq(otpsTable.code, code));
  const valid = rows.some(otp => otp.expiresAt > new Date());
  res.json({ valid });
});

export default router;
