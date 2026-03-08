import { Request, Response } from "express";
import {
  searchGames,
  getOneProduct,
  getUserOrder,
  getUserCartItem,
  addProductToCart,
  removeProductFromCart,
  getOrderDetail,
} from "../services/productsService";
import { getUser } from "../services/personalization";

export const loadCustomerHomePage = async (req: Request, res: Response) => {
  const search = (req.query["search-product"] as string) || "";
  const sort = (req.query["sort"] as string) || "";

  let games = await searchGames(search);

  if (sort === "price_asc") {
    games = games!.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    games = games!.sort((a, b) => b.price - a.price);
  }

  res.render("client/index", { games, search, sort, alert: req.query.alert as string });
};

export const loadProductDetail = async (req: Request, res: Response) => {
  const game = await getOneProduct(req, res);

  if (!game) {
    return res.render("client/product-detail", { game: null, isPurchased: false });
  }

  const userId = req.session.userId as string;

  const orders = await getUserOrder(userId) || [];
  const isPurchased = orders.some((order: any) =>
    (order.items || []).some((it: any) =>
      String(it.gameId ?? it.productId ?? it.id) === String(game.id)
    )
  );

  return res.render("client/product-detail", { game, isPurchased });
};

export const loadOrder = async (req: Request, res: Response) => {
  res.render("client/orders", { orders: await getUserOrder(req.session.userId as string) });
};

export const loadCheckout = async (req: Request, res: Response) => {
  res.render("client/checkout", {
    cartItem: await getUserCartItem(req.session.userId as string),
    errorMsg: req.query.error ? String(req.query.msg || "Checkout failed.") : "",
  });
};

export const loadCustomerProfile = async (req: Request, res: Response) => {
  res.render("client/profile", { user: await getUser(req.session.userId as string) });
};

export const addToCart = async (req: Request, res: Response) => {
  await addProductToCart(req, res);
};
export const removeFromCart = async (req: Request, res: Response) => {
  await removeProductFromCart(req, res);
}
export const getCustomerOrderDetail = async (req: Request, res: Response) => {

  const userId = req.session.userId as string;
  const orderId = req.params.id as string;

  if (!orderId) {
    return res.status(400).json({ message: "Order id is required" });
  }

  const orderDetail = await getOrderDetail(userId, orderId);

  if (!orderDetail) {
    return res.status(404).json({ message: "Order not found!" });
  }

  return res.status(200).json(orderDetail);
};

export { checkout } from "../services/productsService";