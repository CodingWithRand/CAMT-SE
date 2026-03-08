import express from "express";
import dotenv from "dotenv";
dotenv.config();
import session from "express-session";
import path from "path";
import mongoose from "mongoose";
import {
  createNewGame,
  deleteGame,
  editProduct,
  getAdminOrderDetail,
  getProductForm,
  loadOrders,
  loadProducts,
  loadProfile,
  updateGame,
  updateOrdersStatus,
} from "./controllers/adminControllers";
import {
  addToCart,
  checkout,
  getCustomerOrderDetail,
  loadCheckout,
  loadCustomerHomePage,
  loadCustomerProfile,
  loadOrder,
  loadProductDetail,
} from "./controllers/clientControllers";
import {
  loadHome,
  loginController,
  logoutController,
} from "./controllers/userControllers";
import {
  requireLogin,
  requireAdminCredentials,
} from "./middlewares/requireLogin";
import { removeProductFromCart } from "./services/productsService";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3000;

/* --- 1. EJS Setup --- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

/* --- 2. Middleware --- */
// Body parser to handle form submissions (A2 Feature)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' folder (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "../public")));

// Session middleware (MemoryStore by default) — for learning/demo only
app.use(
  session({
    secret: "replace-with-a-strong-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 1000 },
  }),
);

app.get("/", loadHome);
app.post("/login", rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 20,
  message: "Too many requests, please try again later.", 
  handler: (req, res) => res.redirect("/?q=You have reached rate limit! Please try again in 30 minutes.")
}), loginController);
app.post("/logout", requireLogin, logoutController);

/* ------------------ ADMIN ROUTES ----------------- */

app.get("/admin", requireLogin, requireAdminCredentials, loadProducts);
app.get("/admin/orders", requireLogin, requireAdminCredentials, loadOrders);
app.get("/admin/profile", requireLogin, requireAdminCredentials, loadProfile);
app.get(
  "/admin/product/:id",
  requireLogin,
  requireAdminCredentials,
  editProduct,
);
app.get(
  "/admin/product/add",
  requireLogin,
  requireAdminCredentials,
  getProductForm,
);

/* ------------------------------------------------- */

/* ----------------- CLIENT ROUTES ----------------- */

app.get("/customer", requireLogin, loadCustomerHomePage);
app.get("/customer/product/:id", requireLogin, loadProductDetail);
app.get("/customer/checkout", requireLogin, loadCheckout);
app.get("/customer/orders", requireLogin, loadOrder);
app.get("/customer/profile", requireLogin, loadCustomerProfile);

/* ------------------------------------------------- */

// crud
app.post("/customer/cart/add/:id", requireLogin, addToCart);
app.post("/customer/cart/delete/:id", requireLogin, removeProductFromCart);
app.post("/customer/checkout", requireLogin, checkout);
app.get("/customer/order/:id", requireLogin, getCustomerOrderDetail);
app.get("/admin/order/:userId/:id", requireLogin, getAdminOrderDetail);
app.post(
  "/admin/product/add",
  requireLogin,
  requireAdminCredentials,
  createNewGame,
);
app.post(
  "/admin/product/edit/:id",
  requireLogin,
  requireAdminCredentials,
  updateGame,
);
app.get(
  "/admin/product/delete/:id",
  requireLogin,
  requireAdminCredentials,
  deleteGame,
);
// order crud
app.post(
  "/admin/orders/update-status",
  requireLogin,
  requireAdminCredentials,
  updateOrdersStatus,
);

app.listen(PORT, async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("✅ MongoDB connected");
  console.log(`Access the server at http://localhost:${PORT}`);
});
