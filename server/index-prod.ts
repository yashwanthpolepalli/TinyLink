import fs from "node:fs";
import "dotenv/config";
import path from "node:path";

import express from "express";
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

// Create Express app for Vercel
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/healthz", async (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0",
  });
});

// Get all links
app.get("/api/links", async (req, res) => {
  try {
    const links = await storage.getAllLinks();
    res.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

// Get single link by code
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

// Create new link
app.post("/api/links", async (req, res) => {
  try {
    const result = insertLinkSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: result.error.errors,
      });
    }

    const { targetUrl, code: customCode } = result.data;

    // Generate or use custom code
    let code = customCode || generateShortCode();

    // Check if code already exists
    if (customCode) {
      const existing = await storage.getLinkByCode(customCode);
      if (existing && !existing.deletedAt) {
        return res.status(409).json({
          error: "Short code already exists",
        });
      }
    }

    const link = await storage.createLink({
      code,
      targetUrl,
    });

    res.status(201).json(link);
  } catch (error) {
    console.error("Error creating link:", error);
    res.status(500).json({ error: "Failed to create link" });
  }
});

// Delete link
app.delete("/api/links/:code", async (req, res) => {
  try {
    const { code } = req.params;
    await storage.deleteLink(code);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).json({ error: "Failed to delete link" });
  }
});

// Redirect route (must be after API routes)
app.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    // Skip if it's a reserved route, Vite internal route, or has a file extension
    if (
      code === "healthz" ||
      code.startsWith("api") ||
      code === "code" ||
      code.startsWith("@") ||  // Vite internal routes like @react-refresh, @vite
      code.startsWith("src") || // Source files
      code.includes(".")  // Files with extensions
    ) {
      return next();
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

// Fallback to index.html for SPA (only for non-API routes)
const distPath = path.resolve(import.meta.dirname, "public");
const indexPath = path.resolve(distPath, "index.html");

if (fs.existsSync(indexPath)) {
  app.use("*", (_req, res) => {
    res.sendFile(indexPath);
  });
}

// Export for Vercel
export default app;
