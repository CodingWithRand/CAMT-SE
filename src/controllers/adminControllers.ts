import { Request, Response } from "express";
import {
  addProduct,
  deleteProduct,
  getOneProduct,
  searchGames,
  searchOrders,
  updateOrders,
  updateProduct,
  getOrderDetail
} from "../services/productsService";
import { getUser } from "../services/personalization";

export const loadProducts = (req: Request, res: Response) => {
  const search = (req.query["search-product"] as string) || "";
  res.render("admin/index", { games: searchGames(req.query['search-product'] as string), search });
};
export const loadOrders = (req: Request, res: Response) => {
  const search = (req.query["search-order"] as string) || "";
  res.render("admin/orders", { orders: searchOrders(req.query['search-order'] as string), search });
};
export const loadProfile = (req: Request, res: Response) => {
  res.render("admin/profile", { admin: getUser(req.session.userId as string) });
};
export const editProduct = (req: Request, res: Response) => {
  res.render("admin/product-detail-edit", { game: getOneProduct(req, res) });
};

export const getProductForm = (req: Request, res: Response) => {
  res.render("admin/product-detail-edit", { game: null });
};
// crud
export const createNewGame = (req: Request, res: Response) => {
  addProduct(req, res);
};
export const deleteGame = (req: Request, res: Response) => {
  deleteProduct(req, res);
};
export const updateGame = (req: Request, res: Response) => {
  updateProduct(req, res);
};
export const updateOrdersStatus = (req: Request, res: Response) => {
  updateOrders(req, res);
};
export const getAdminOrderDetail = (req: Request, res: Response) => {
  const orderDetail = getOrderDetail(req.params.userId as string, req.params.id as string);
  if(!orderDetail) return res.status(404).json({ message: "Order not found!" })
  return res.status(200).json(orderDetail);
}
