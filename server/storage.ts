import { links, type Link, type InsertLink } from "@shared/schema";
import { db } from "./db";
import { eq, isNull } from "drizzle-orm";

export interface IStorage {
  getAllLinks(): Promise<Link[]>;
  getLinkByCode(code: string): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  deleteLink(code: string): Promise<void>;
  incrementClicks(code: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllLinks(): Promise<Link[]> {
    const allLinks = await db
      .select()
      .from(links)
      .where(isNull(links.deletedAt))
      .orderBy(links.createdAt);
    return allLinks;
  }

  async getLinkByCode(code: string): Promise<Link | undefined> {
    const [link] = await db
      .select()
      .from(links)
      .where(eq(links.code, code));
    return link || undefined;
  }

  async createLink(insertLink: InsertLink): Promise<Link> {
    const [link] = await db
      .insert(links)
      .values(insertLink)
      .returning();
    return link;
  }

  async deleteLink(code: string): Promise<void> {
    await db
      .update(links)
      .set({ deletedAt: new Date() })
      .where(eq(links.code, code));
  }

  async incrementClicks(code: string): Promise<void> {
    const [link] = await db
      .select()
      .from(links)
      .where(eq(links.code, code));
    
    if (link) {
      await db
        .update(links)
        .set({
          totalClicks: link.totalClicks + 1,
          lastClicked: new Date(),
        })
        .where(eq(links.code, code));
    }
  }
}

export const storage = new DatabaseStorage();
