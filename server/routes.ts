import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLinkSchema } from "@shared/schema";

function generateShortCode(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  const codeLength = Math.max(6, Math.min(8, length));
  for (let i = 0; i < codeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/healthz", async (req, res) => {
    res.status(200).json({
      ok: true,
      version: "1.0",
    });
  });

  app.get("/api/links", async (req, res) => {
    try {
      const links = await storage.getAllLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  app.get("/api/links/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const link = await storage.getLinkByCode(code);

      if (!link || link.deletedAt) {
        return res.status(404).json({ error: "Link not found" });
      }

      res.json(link);
    } catch (error) {
      console.error("Error fetching link:", error);
      res.status(500).json({ error: "Failed to fetch link" });
    }
  });

  app.post("/api/links", async (req, res) => {
    try {
      let { targetUrl, code } = req.body;

      if (!code) {
        let attempts = 0;
        const maxAttempts = 20;
        let codeLength = 6;
        
        while (attempts < maxAttempts) {
          code = generateShortCode(codeLength);
          const existing = await storage.getLinkByCode(code);
          if (!existing) break;
          
          attempts++;
          if (attempts % 5 === 0 && codeLength < 8) {
            codeLength++;
          }
        }

        if (attempts >= maxAttempts) {
          return res.status(503).json({ 
            error: "Service temporarily unavailable. Unable to generate unique code. Please try again or provide a custom code." 
          });
        }
      } else {
        if (code.length < 6 || code.length > 8 || !/^[A-Za-z0-9]+$/.test(code)) {
          return res.status(400).json({ 
            error: "Invalid code format. Code must be 6-8 alphanumeric characters." 
          });
        }
      }

      const validationResult = insertLinkSchema.safeParse({ targetUrl, code });
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors,
        });
      }

      const existingLink = await storage.getLinkByCode(code);
      if (existingLink) {
        return res.status(409).json({ error: "Code already exists" });
      }

      const link = await storage.createLink({ targetUrl, code });
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(500).json({ error: "Failed to create link" });
    }
  });

  app.delete("/api/links/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const link = await storage.getLinkByCode(code);

      if (!link || link.deletedAt) {
        return res.status(404).json({ error: "Link not found" });
      }

      await storage.deleteLink(code);
      res.status(200).json({ message: "Link deleted successfully" });
    } catch (error) {
      console.error("Error deleting link:", error);
      res.status(500).json({ error: "Failed to delete link" });
    }
  });

  app.get("/:code", async (req, res) => {
    try {
      const { code } = req.params;

      if (code === "healthz" || code.startsWith("api") || code === "code") {
        return;
      }

      const link = await storage.getLinkByCode(code);

      if (!link || link.deletedAt) {
        return res.status(404).send("Link not found");
      }

      await storage.incrementClicks(code);

      res.redirect(302, link.targetUrl);
    } catch (error) {
      console.error("Error redirecting:", error);
      res.status(500).send("Internal server error");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
