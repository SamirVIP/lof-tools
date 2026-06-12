import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const otpsTable = pgTable("otps", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  validityLabel: text("validity_label").notNull(),
});

export const insertOtpSchema = createInsertSchema(otpsTable).omit({ createdAt: true });
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type Otp = typeof otpsTable.$inferSelect;
