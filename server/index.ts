import 'dotenv/config';
import cors from 'cors';
import express, { NextFunction, type Request, Response } from "express";
import { config, validateRequiredEnvironmentVariables } from "./environment";
import { registerRoutes } from "./routes";
import { log, serveStatic, setupVite } from "./vite";

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000', 
    'http://localhost:5173',
    /\.replit\.dev$/,
    /\.replit\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware for HTTPS and SSL
app.use((req, res, next) => {
  // Force HTTPS in production
  if (config.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  
  // Security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health check endpoint for deployment
app.get('/health', (req, res) => {
  const envValidation = validateRequiredEnvironmentVariables();
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: config.NODE_ENV,
    environmentValid: envValidation.isValid,
    missingVars: envValidation.missingVars
  });
});

// Environment validation
const envValidation = validateRequiredEnvironmentVariables();
if (!envValidation.isValid) {
  log(`Warning: Missing critical environment variables: ${envValidation.missingVars.join(', ')}`);
  log('The application may not function properly without these variables.');
} else {
  log('All required environment variables are present.');
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = config.PORT;
  
  // Use localhost for development to avoid macOS ENOTSUP error
  const host = config.NODE_ENV === 'production' ? "0.0.0.0" : "localhost";
  
  server.listen(port, host, () => {
    log(`🚀 Servidor rodando em http://${host}:${port}`);
    log(`🌐 NODE_ENV: ${config.NODE_ENV}`);
  });
})();
