import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi utama untuk menghubungkan server ke Google Apps Script
function getAppsScriptConnection() {
  // Masukkan Link Deployment Web App Anda di bawah ini
  const URL_TARGET = "https://script.google.com/macros/s/AKfycbzuiqDZ1iIlLIXX38hzQ9oAZXu5yOkxxUAKLMGxp6Wbid_fPVezRnHN3XxPMeCxnki8LA/exec";
  
  return {
    url: URL_TARGET,
    isValid: (URL_TARGET as string) !== "" && URL_TARGET.startsWith("https://script.google.com")
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to proxy Google Apps Script calls
  app.all("/api/proxy", async (req, res) => {
    const connection = getAppsScriptConnection();

    if (!connection.isValid) {
      return res.status(500).json({ 
        error: "Koneksi Gagal", 
        message: "Silakan buka server.ts dan masukkan link deployment Apps Script Anda di fungsi getAppsScriptConnection." 
      });
    }

    try {
      const url = new URL(connection.url);
      
      // Merge query parameters if GET
      if (req.method === 'GET') {
        Object.entries(req.query).forEach(([key, value]) => {
          url.searchParams.append(key, value as string);
        });
      }

      const options: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      };

      if (req.method === 'POST') {
        options.body = JSON.stringify(req.body);
        console.log("Proxying POST to Google with body:", options.body);
      }

      const response = await fetch(url.toString(), options);
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        res.status(response.status).json(data);
      } catch (e) {
        // Jika bukan JSON, berarti ada error dari Google (misal: Script Error atau Permission)
        console.error("Non-JSON response from Google:", text);
        res.status(500).json({ 
          success: false, 
          message: "Google Apps Script tidak mengembalikan format JSON. Pastikan Script sudah di-deploy sebagai 'Web App' dan akses diset ke 'Anyone'.",
          debug: text.substring(0, 200) 
        });
      }
    } catch (error: any) {
      console.error("Proxy Error:", error);
      res.status(500).json({ error: "Backend proxy error", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
