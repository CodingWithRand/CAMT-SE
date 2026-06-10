/**
 * Blog Platform - Express Application
 * MVC Architecture with middleware and error handling
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import "dotenv/config";

// Middleware
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, asyncHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/authRoutes";
import blogRoutes from "./routes/blogRoutes";
import commentRoutes from "./routes/commentRoutes";
import userRoutes from "./routes/userRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import pageRoutes from "./routes/pageRoutes";

import i18next from 'i18next';
import FilesystemBackend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// LANGUAGE PREFERENCE
// ===========================

i18next
  .use(FilesystemBackend) // Allows reading JSON files
  .use(i18nextMiddleware.LanguageDetector) // Automatically checks cookies, headers, and query strings
  .init({
    // debug: true,
    ignoreJSONStructure: false,
    fallbackLng: 'en', // Default language if detection fails
    preload: ['th', 'en'], // Languages to load into server memory
    backend: {
      loadPath: path.join(__dirname, '..', '/locales/{{lng}}.json') // Path to your files
    },
    detection: {
      order: ['querystring', 'cookie', 'header'], // Look at URL (?lng=th), then cookies, then browser settings
      caches: ['cookie'] // Save preference in a cookie
    }
  });

app.use(i18nextMiddleware.handle(i18next));

app.use((req, res, next) => {
    res.locals.req = req;
    next();
});

// ===========================
// VIEW ENGINE CONFIGURATION
// ===========================

// Tell Express to use EJS
app.set("view engine", "ejs");

// Important: make views folder work after compiling to /dist
app.set("views", path.join(__dirname, "..", "views"));


// ===========================
// GLOBAL MIDDLEWARE
// ===========================

// Request logging
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static files
app.use(express.static("public"));

// ===========================
// ROUTES
// ===========================

// Blog routes (includes home page, compose, blog view)
app.use("/", blogRoutes);

// Auth routes (login, register, logout, OAuth)
app.use("/", authRoutes);

// Comment routes
app.use("/", commentRoutes);

// User routes (account, profile)
app.use("/", userRoutes);

// Upload routes
app.use("/", uploadRoutes);

// Page routes (about, contact)
app.use("/", pageRoutes);

// ===========================
// 404 NOT FOUND HANDLER
// ===========================

app.use((req: Request, res: Response) => {
  res.status(404).render("error", { pageTitle: "Page Not Found" });
});

// ===========================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ===========================

app.use(errorHandler);

// ===========================
// SERVER START
// ===========================

app.listen(PORT, async () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
