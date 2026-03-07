import { Game, Platform, Availability } from "../models/game.model";
import { Order, OrderItem } from "../models/order.model";
import { Request, Response } from "express";
import { getData, saveData, stringToArray } from "./util";
import { getUser } from "./personalization";
import { User } from "../models/user.model";

// 1. Get All Games
export const getAllGames = (): Game[] => {
  const data = getData();
  return data.games;
};

// get one game product (CLIENT)
export const getOneProduct = (req: Request, res: Response) => {
  const gameid = req.params.id;
  const games: Game[] = getData().games;
  const game = games.find((g) => String(g.id) === String(gameid));
  return game;
};

export const searchGames = (q?: string, id?: string): Game[] => {
  if (id) return getAllGames().filter((g) => String(g.id) === String(id));
  if (!q) return getAllGames();
  const games = getAllGames();
  return games.filter((g) =>
    g.title.toLowerCase().match(JSON.stringify(q).toLowerCase() as string),
  );
};

export const searchOrders = (q?: string): Order[] => {
  if (!q) return getAllOrders();
  const orders = getAllOrders();
  return orders.filter((o) =>
    o.id.toLowerCase().match(q.toLowerCase() as string),
  );
};

// 2. Add Product (ADMIN)
export const addProduct = (req: Request, res: Response) => {
  const db = getData();
  const gamesList = db.games;

  // Ensure platforms is an array even if one checkbox is ticked
  let platforms = req.body.platforms;
  if (!platforms) platforms = [];
  if (!Array.isArray(platforms)) platforms = [platforms];

  // safety check for form data
  if (Number(req.body.price) <= 0 || Number(req.body.stock) < 0) {
    // Redirect back to the 'add' or 'edit' page with an error parameter
    return res.redirect("/admin/product/add?error=invalid_data");
  }

  const newGame: Game = {
    id: Date.now().toString(), // Generate a real ID
    slug: req.body.title.toLowerCase().replace(/ /g, "-"),
    title: req.body.title,
    developer: req.body.developer,
    publisher: req.body.publisher,
    platforms: platforms as Platform[],
    genres: stringToArray(req.body.genres),
    tags: stringToArray(req.body.tags),
    releaseDate: req.body.releaseDate,
    availability: (req.body.availability as Availability) || "available",
    price: parseFloat(req.body.price),
    currency: "$",
    thumbnailUrl: req.body.thumbnailUrl || "",
    description: req.body.description,
    stock: parseInt(req.body.stock),
    isPreOrder: req.body.isPreOrder === "on",
  };

  gamesList.push(newGame);
  saveData(db); // Actually write to file
  res.redirect("/admin?success=true&action=add");
};

// 3. Update Product (ADMIN)
export const updateProduct = (req: Request, res: Response) => {
  const db = getData();
  const gameId = req.params.id;
  const gamesList = db.games;

  const index = gamesList.findIndex((g: Game) => g.id === gameId);

  if (index !== -1) {
    let platforms = req.body.platforms;
    if (!platforms) platforms = [];
    if (!Array.isArray(platforms)) platforms = [platforms];

    gamesList[index] = {
      ...gamesList[index], // Keep existing ID/Slug if you want
      ...req.body,
      platforms: platforms as Platform[],
      genres: stringToArray(req.body.genres),
      tags: stringToArray(req.body.tags),
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      isPreOrder: req.body.isPreOrder === "on",
    };

    saveData(db);
  }
  res.redirect("/admin");
};

// 4. Delete Product (ADMIN)
export const deleteProduct = (req: Request, res: Response) => {
  const db = getData();
  const gameId = req.params.id;
  db.games = db.games.filter((g: Game) => g.id !== gameId);

  saveData(db);
  res.redirect("/admin?success=true&action=delete");
};

export const getAllOrders = (): Order[] => getData().orders;
export const getUserOrder = (uid: string) =>
  getAllOrders().filter((o) => o.userId === uid);

// order updates (ADMIN)
export const updateOrders = (req: Request, res: Response) => {
  const { orderIds, status } = req.body; // e.g., ["101", "102"], "paid"
  const db = getData();
  if (status === "delete") {
    db.orders.forEach((o: Order) => {
      o.items.forEach((oi: OrderItem) => {
        const thegame = searchGames(undefined, String(oi.gameId));
        db.games[db.games.findIndex((g: Game) => g.id === thegame[0]?.id)].stock++;
      });
    });

    db.orders = db.orders.filter((o: Order) => !orderIds.includes(o.id));
  } else {
    // Update the status for matching IDs
    db.orders.forEach((order: any) => {
      if (orderIds.includes(order.id)) {
        order.status = status;
      }
    });
  }
  saveData(db);
  res.sendStatus(200);
};

export const getUserCartItem = (uid: string): OrderItem[] => getUser(uid).cart;

/* =========================
   CLIENT: Add to Cart
   - Redirect back with success/error + msg for toaster
   ========================= */
export const addProductToCart = (req: Request, res: Response) => {
  const { id } = req.params; // FIX: declare before use
  const wholeData = getData();

  const pickedGame = wholeData.games.find((g: Game) => String(g.id) === String(id));

  const back = req.get("Referer") || "/customer";
  const join = back.includes("?") ? "&" : "?";

  if (!pickedGame) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("Game not found")}`);
  }

  if (pickedGame.stock === 0) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("This game is out of stock!")}`);
  }

  if (pickedGame.availability === "delisted") {
    return res.redirect(
      `${back}${join}error=1&msg=${encodeURIComponent(
        "This game has been delisted, you can no longer add it to your cart.",
      )}`,
    );
  }

  const userId = req.session.userId as string;
  const user = wholeData.users.find((u: User) => u.id === userId);

  if (!user) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("User not found")}`);
  }

  const userCart = getUserCartItem(userId);

  // Optional: prevent duplicates (recommended)
  const exists = userCart.some((it: any) => String(it.gameId) === String(pickedGame.id));
  if (exists) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("Already in cart.")}`);
  }

  userCart.push({
    gameId: pickedGame.id,
    title: pickedGame.title,
    thumbnailUrl: pickedGame.thumbnailUrl,
    priceAtPurchase: pickedGame.price,
  });

  user.cart = userCart;
  saveData(wholeData);

  return res.redirect(`${back}${join}success=1&msg=${encodeURIComponent("Added to cart!")}`);
};

export const removeProductFromCart = (req: Request, res: Response) => {
  const { id } = req.params;
  const wholeData = getData();
  const userId = req.session.userId as string;

  const user = wholeData.users.find((u: User) => u.id === userId);
  if (!user) return res.status(404).send("User not found");

  user.cart = (user.cart || []).filter((it: OrderItem) => String(it.gameId) !== String(id));

  saveData(wholeData);
  return res.redirect("/customer/checkout?success=1&msg=" + encodeURIComponent("Removed from cart."));
};

/* =========================
   CLIENT: Checkout
   - Validate cart items (delisted/out of stock)
   - Create order, clear cart
   - Redirect with toast params
   ========================= */
export const checkout = (req: Request, res: Response) => {
  const wholeData = getData();
  const userId = req.session.userId as string;

  const back = req.get("Referer") || "/customer/checkout";
  const join = back.includes("?") ? "&" : "?";

  const cart = getUserCartItem(userId) || [];

  if (cart.length === 0) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("Your cart is empty.")}`);
  }

  const outOfStockGames: string[] = [];
  const delistedGames: string[] = [];

  for (const item of cart) {
    const thegame = searchGames(undefined, String(item.gameId));
    const g = thegame[0];

    if (!g) continue;
    if (g.stock === 0) outOfStockGames.push(g.title);
    if (g.availability === "delisted") delistedGames.push(g.title);
  }

  // FIX: if there ARE invalid items, block checkout
  if (outOfStockGames.length > 0 || delistedGames.length > 0) {
    const parts: string[] = [];
    if (outOfStockGames.length > 0) parts.push(`Out of stock: ${outOfStockGames.join(", ")}`);
    if (delistedGames.length > 0) parts.push(`Delisted: ${delistedGames.join(", ")}`);

    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent(parts.join(" | "))}`);
  }

  for(const item of cart) {
    const thegame = searchGames(undefined, String(item.gameId));
    const g = thegame[0];
    if (!g) continue;
    wholeData.games[wholeData.games.findIndex((tg: Game) => tg.id === g.id)].stock--; 
  }

  // Generate next order id safely
  const last = wholeData.orders[wholeData.orders.length - 1];
  const nextNum =
    last && typeof last.id === "string" && last.id.startsWith("ord_")
      ? parseInt(last.id.slice(4), 10) + 1
      : wholeData.orders.length + 1;

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.priceAtPurchase,
    0,
  );

  wholeData.orders.push({
    id: "ord_" + nextNum,
    userId,
    items: cart,
    totalAmount,
    status: "paid",
    // storing ISO string is safer for JSON storage than Date object
    dateCreated: new Date().toISOString() as any,
  });

  const user = wholeData.users.find((u: User) => u.id === userId);
  if (user) user.cart = [];

  saveData(wholeData);

  // Redirect to orders (better UX) OR back to checkout
  return res.redirect(`/customer/orders?success=1&msg=${encodeURIComponent("Payment successful!")}`);
};

export const getOrderDetail = (uid: string, oid: string) => {
  const userOrders = getUserOrder(uid);
  return userOrders.find((o: Order) => o.id === oid);
}