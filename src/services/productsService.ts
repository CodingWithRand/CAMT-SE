import { Game, Platform, Availability, GameModel } from "../models/game.model";
import { Order, OrderItem, OrderModel } from "../models/order.model";
import { Request, Response } from "express";
import { addData, stringToArray, updateOneData, deleteOneData, deleteManyData, updateManyData } from "./util";
// import { getUser } from "./personalization";
import { User, UserModel } from "../models/user.model";

// 1. Get All Games
// export const getAllGames = (): Game[] => {
//   const data = getData();
//   return data.games;
// };

// get one game product (CLIENT)
export const getOneProduct = async (req: Request, res: Response) => {
  const gameid = req.params.id;
  const game = await GameModel.findOne({ id: gameid! });
  return game;
};

export const searchGames = async (q?: string, id?: string): Promise<Game[] | undefined> => {
  if (id) return await GameModel.find({ id: { $regex: id } });
  if (!q) return GameModel.find();
  return await GameModel.find({ title: { $regex: q, $options: "i" } });
  // const games = getAllGames();
  // return games.filter((g) =>
  //   g.title.toLowerCase().match(JSON.stringify(q).toLowerCase() as string),
  // );
};

export const searchOrders = async (q?: string): Promise<Order[] | undefined> => {
  if (!q) return await OrderModel.find();
  // const orders = getAllOrders();
  return await OrderModel.find({ id: { $regex: q, $options: "i" }});
};

// 2. Add Product (ADMIN)
export const addProduct = async (req: Request, res: Response) => {
  // const db = getData();
  // const gamesList = db.games;

  // Ensure platforms is an array even if one checkbox is ticked
  let platforms = req.body.platforms;
  if (!platforms) platforms = [];
  if (!Array.isArray(platforms)) platforms = [platforms];

  // safety check for form data
  if (Number(req.body.price) < 0) {
    // Redirect back to the 'add' or 'edit' page with an error parameter
    return res.redirect("/admin/product/add?error=Price can't be negative");
  }
  if (Number(req.body.stock) < 0) {
    // Redirect back to the 'add' or 'edit' page with an error parameter
    return res.redirect("/admin/product/add?error=Stock can't be negative!");
  }
  if (!req.body.title) {
    // Redirect back to the 'add' or 'edit' page with an error parameter
    return res.redirect("/admin/product/add?error=Game must have title!");
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

  // gamesList.push(newGame);
  await addData(GameModel, newGame); // Actually write to file
  res.redirect("/admin?success=true&action=add");
};

// 3. Update Product (ADMIN)
export const updateProduct = async (req: Request, res: Response) => {
  // const db = getData();
  const gameId = req.params.id;
  // const gamesList = db.games;

  // const index = gamesList.findIndex((g: Game) => g.id === gameId);

  // if (index !== -1) {
    let platforms = req.body.platforms;
    if (!platforms) platforms = [];
    if (!Array.isArray(platforms)) platforms = [platforms];

    // gamesList[index] = {
    //   ...gamesList[index], // Keep existing ID/Slug if you want
    //   ...req.body,
    //   platforms: platforms as Platform[],
    //   genres: stringToArray(req.body.genres),
    //   tags: stringToArray(req.body.tags),
    //   price: parseFloat(req.body.price),
    //   stock: parseInt(req.body.stock),
    //   isPreOrder: req.body.isPreOrder === "on",
    // };

    await updateOneData(GameModel, { id: gameId }, {
      ...req.body,
      platforms: platforms as Platform[],
      genres: stringToArray(req.body.genres),
      tags: stringToArray(req.body.tags),
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      isPreOrder: req.body.isPreOrder === "on",
    })
    // saveData(db);
  // }
  res.redirect("/admin");
};

// 4. Delete Product (ADMIN)
export const deleteProduct = async (req: Request, res: Response) => {
  // const db = getData();
  // const gameId = req.params.id;
  // db.games = db.games.filter((g: Game) => g.id !== gameId);

  deleteOneData(GameModel, { id: req.params.id });
  res.redirect("/admin?success=true&action=delete");
};

// export const getAllOrders = (): Order[] => getData().orders;
export const getUserOrder = async (uid: string): Promise<Order[]> =>
  await OrderModel.find({ userId: uid });
  // getAllOrders().filter((o) => o.userId === uid);

// order updates (ADMIN)
export const updateOrders = async (req: Request, res: Response) => {
  const { orderIds, status } = req.body; // e.g., ["101", "102"], "paid"
  // const db = getData();
  if (status === "delete") {
    const orders = await OrderModel.find({ id: { $in: orderIds } })
    for(const o of orders){
      // for(const oi of o.items){
      //   const thegame = await searchGames(undefined, String(oi.gameId));
      //   db.games[db.games.findIndex((g: Game) => g.id === thegame![0]?.id)].stock++;
      // }
      await updateManyData(GameModel, { id: { $in: o.items.map((oi: OrderItem) => String(oi.gameId)) }}, { $inc: { stock: 1 } });
    }

    await deleteManyData(OrderModel, { id: { $in: orderIds } });
    // db.orders = db.orders.filter((o: Order) => !orderIds.includes(o.id));
  } else {
    // Update the status for matching IDs
    await updateManyData(OrderModel, { id: { $in: orderIds } }, { status });
    // db.orders.forEach((order: any) => {
    //   if (orderIds.includes(order.id)) {
    //     order.status = status;
    //   }
    // });
  }
  // saveData(db);
  res.sendStatus(200);
};

export const getUserCartItem = async (uid: string): Promise<OrderItem[] | undefined> => ((await UserModel.findOne({ id: uid })) as User)!.cart;

/* =========================
   CLIENT: Add to Cart
   - Redirect back with success/error + msg for toaster
   ========================= */
export const addProductToCart = async (req: Request, res: Response) => {
  const { id } = req.params; // FIX: declare before use
  // const wholeData = getData();

  const pickedGame = await GameModel.findOne({ id: id! });

  const back = req.get("Referer") || "/customer";
  const join = back.includes("?") ? "&" : "?";

  if (!pickedGame) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("Game not found")}`);
  }

  if (pickedGame.stock === 0) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("This game is out of stock!")}`);
  }

  if (pickedGame.availability.toLowerCase() === "delisted") {
    return res.redirect(
      `${back}${join}error=1&msg=${encodeURIComponent(
        "This game has been delisted, you can no longer add it to your cart.",
      )}`,
    );
  }

  const userId = req.session.userId as string;
  const user = await UserModel.findOne({ id: userId });
  if (!user) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("User not found")}`);
  }

  const userCart = await getUserCartItem(userId);

  // Optional: prevent duplicates (recommended)
  const exists = userCart!.some((it: any) => String(it.gameId) === String(pickedGame.id));
  if (exists) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("Already in cart.")}`);
  }

  userCart!.push({
    gameId: pickedGame.id,
    title: pickedGame.title,
    thumbnailUrl: pickedGame.thumbnailUrl!,
    priceAtPurchase: pickedGame.price!,
  });

  await updateOneData(UserModel, { id: userId }, { cart: userCart });
  // user.cart = userCart;
  // saveData(wholeData);

  return res.redirect(`${back}${join}success=1&msg=${encodeURIComponent("Added to cart!")}`);
};

export const removeProductFromCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  // const wholeData = getData();
  const userId = req.session.userId as string;

  const user = await UserModel.findOne({ id: userId });
  if (!user) return res.status(404).send("User not found");

  // saveData(wholeData);
  await updateOneData(UserModel, { id: userId }, { cart: (user.cart || []).filter((it: OrderItem) => String(it.gameId) !== String(id)) })
  return res.redirect("/customer/checkout?success=1&msg=" + encodeURIComponent("Removed from cart."));
};

/* =========================
   CLIENT: Checkout
   - Validate cart items (delisted/out of stock)
   - Create order, clear cart
   - Redirect with toast params
   ========================= */
export const checkout = async (req: Request, res: Response) => {
  // const wholeData = getData();
  const userId = req.session.userId as string;

  const back = req.get("Referer") || "/customer/checkout";
  const join = back.includes("?") ? "&" : "?";

  const cart = await getUserCartItem(userId) || [];

  if (cart.length === 0) {
    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent("Your cart is empty.")}`);
  }

  const outOfStockGames: string[] = [];
  const delistedGames: string[] = [];
  const comingSoonGames: string[] = [];

  for (const item of cart) {
    const thegame = await searchGames(undefined, String(item.gameId));
    const g = thegame![0];

    if (!g) continue;
    if (g.stock === 0) outOfStockGames.push(g.title);
    if (g.availability.toLowerCase() === "delisted") delistedGames.push(g.title);
    if (g.availability.toLowerCase() === "coming_soon") comingSoonGames.push(g.title);
  }

  // FIX: if there ARE invalid items, block checkout
  if (outOfStockGames.length > 0 || delistedGames.length > 0 || comingSoonGames.length > 0) {
    const parts: string[] = [];
    if (outOfStockGames.length > 0) parts.push(`Out of stock: ${outOfStockGames.join(", ")}`);
    if (delistedGames.length > 0) parts.push(`Delisted: ${delistedGames.join(", ")}`);
    if (comingSoonGames.length > 0) parts.push(`Coming soon: ${comingSoonGames.join(", ")}`);

    return res.redirect(`${back}${join}error=1&msg=${encodeURIComponent(parts.join(" | "))}`);
  }

  await updateManyData(GameModel, { id: { $in: cart.map((oi: OrderItem) => String(oi.gameId)) }}, { $inc: { stock: -1 } });
  // for(const item of cart) {
  //   const thegame = await searchGames(undefined, String(item.gameId));
  //   const g = thegame![0];
  //   if (!g) continue;
    
  //   wholeData.games[wholeData.games.findIndex((tg: Game) => tg.id === g.id)].stock--; 
  // }

  // Generate next order id safely
  
  const last = (await OrderModel.find().sort({ _id: -1 }).limit(1))[0];
  const nextNum =
    last && typeof last?.id === "string" && last?.id.startsWith("ord_")
      ? parseInt(last?.id.slice(4), 10) + 1
      : (await OrderModel.countDocuments()) + 1;

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.priceAtPurchase,
    0,
  );

  await addData(OrderModel, {
    id: "ord_" + nextNum,
    userId,
    items: cart,
    totalAmount,
    status: "paid",
    // storing ISO string is safer for JSON storage than Date object
    dateCreated: new Date().toISOString() as any,
  })
  // wholeData.orders.push();

  // const user = wholeData.users.find((u: User) => u.id === userId);
  // if (user) user.cart = [];
  await updateOneData(UserModel, { id: userId }, { cart: [] })

  // saveData(wholeData);

  // Redirect to orders (better UX) OR back to checkout
  return res.redirect(`/customer/orders?success=1&msg=${encodeURIComponent("Payment successful!")}`);
};

export const getOrderDetail = async (uid: string, oid: string) => {
  const userOrders = await getUserOrder(uid);
  return userOrders.find((o: Order) => o.id === oid);
}