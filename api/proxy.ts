import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Masukkan Link Deployment Web App Anda di sini (fallback)
  const FALLBACK_URL = "https://script.google.com/macros/s/AKfycbzuiqDZ1iIlLIXX38hzQ9oAZXu5yOkxxUAKLMGxp6Wbid_fPVezRnHN3XxPMeCxnki8LA/exec";
  const URL_TARGET = process.env.APPS_SCRIPT_URL || FALLBACK_URL;

  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const url = new URL(URL_TARGET);
    
    // Merge query parameters for GET requests
    if (req.method === 'GET' && req.query) {
      Object.entries(req.query).forEach(([key, value]) => {
        if (!url.searchParams.has(key)) {
          url.searchParams.append(key, Array.isArray(value) ? value[0] : (value as string));
        }
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
    }

    const response = await fetch(url.toString(), options);
    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch (e) {
      // Jika bukan JSON, mungkin error dari Google Apps Script
      console.error("Non-JSON response from Google:", text);
      res.status(500).json({ 
        success: false, 
        message: "Google Apps Script tidak mengembalikan format JSON. Pastikan Script sudah di-deploy sebagai 'Web App' dan akses diset ke 'Anyone'.",
        debug: text.substring(0, 200) 
      });
    }
  } catch (error: any) {
    console.error("Proxy Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Backend proxy error on Vercel", 
      details: error.message 
    });
  }
}
