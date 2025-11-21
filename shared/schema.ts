import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const links = pgTable("links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 8 }).notNull().unique(),
  targetUrl: text("target_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  totalClicks: integer("total_clicks").default(0).notNull(),
  lastClicked: timestamp("last_clicked"),
  deletedAt: timestamp("deleted_at"),
});

export const insertLinkSchema = createInsertSchema(links, {
  code: z.string().regex(/^[A-Za-z0-9]{6,8}$/, "Code must be 6-8 alphanumeric characters"),
  targetUrl: z.string().url("Invalid URL format"),
}).omit({
  id: true,
  createdAt: true,
  totalClicks: true,
  lastClicked: true,
  deletedAt: true,
});

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;
