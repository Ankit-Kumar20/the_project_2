import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Convert Next.js API request to Web API Request
    const protocol = req.headers["x-forwarded-proto"] || (req.headers["x-forwarded-ssl"] === "on" ? "https" : "http");
    const host = req.headers.host || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    
    // Parse the URL properly - req.url includes pathname and query string
    const fullPath = req.url || "/";
    const [pathname, queryString] = fullPath.split("?");
    
    // Get the path after /api/auth
    const authPath = pathname.replace("/api/auth", "") || "/";
    const url = new URL(`${baseUrl}/api/auth${authPath}`);
    
    // Add query parameters from req.query (Next.js parsed query)
    if (req.query) {
      Object.entries(req.query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          try {
            if (Array.isArray(value)) {
              url.searchParams.set(key, String(value[0]));
            } else if (typeof value === "object") {
              url.searchParams.set(key, JSON.stringify(value));
            } else {
              url.searchParams.set(key, String(value));
            }
          } catch (e) {
            // Skip invalid query params
            console.warn(`Skipping invalid query param: ${key}`, e);
          }
        }
      });
    }

    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        try {
          if (typeof value === "string") {
            headers.set(key, value);
          } else if (Array.isArray(value)) {
            headers.set(key, String(value[0]));
          } else {
            headers.set(key, String(value));
          }
        } catch (e) {
          // Skip invalid headers
          console.warn(`Skipping invalid header: ${key}`, e);
        }
      }
    });

    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const request = new Request(url.toString(), {
      method: req.method || "GET",
      headers,
      body,
    });

    // Handle the auth request
    const response = await auth.handler(request);

    // Convert Web API Response to Next.js API response
    const responseData = await response.text();
    
    // Set headers - ensure values are strings
    response.headers.forEach((value, key) => {
      try {
        res.setHeader(key, String(value));
      } catch (e) {
        // Skip invalid header values
        console.warn(`Skipping invalid response header: ${key}`, e);
      }
    });

    // Set status and send response
    res.status(response.status).send(responseData);
  } catch (error) {
    console.error("Auth handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

