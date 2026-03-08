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

export const loadProducts = async (req: Request, res: Response) => {
  const search = (req.query["search-product"] as string) || "";
  res.render("admin/index", { games: await searchGames(req.query['search-product'] as string), search });
};
export const loadOrders = async (req: Request, res: Response) => {
  const search = (req.query["search-order"] as string) || "";
  res.render("admin/orders", { orders: await searchOrders(req.query['search-order'] as string), search });
};
export const loadProfile = async (req: Request, res: Response) => {
  res.render("admin/profile", { admin: await getUser(req.session.userId as string) });
};
export const editProduct = async (req: Request, res: Response) => {
  res.render("admin/product-detail-edit", { game: await getOneProduct(req, res) });
};

export const getProductForm = (req: Request, res: Response) => {
  res.render("admin/product-detail-edit", { game: null });
};
// crud
export const createNewGame = async (req: Request, res: Response) => {
  try {

    await addProduct(req, res);
  } catch (e) { console.error(e) }
};
export const deleteGame = async (req: Request, res: Response) => {
  await deleteProduct(req, res);
};
export const updateGame = async (req: Request, res: Response) => {
  await updateProduct(req, res);
};
export const updateOrdersStatus = async (req: Request, res: Response) => {
  await updateOrders(req, res);
};
export const getAdminOrderDetail = async (req: Request, res: Response) => {
  const orderDetail = await getOrderDetail(req.params.userId as string, req.params.id as string);
  if(!orderDetail) return res.status(404).json({ message: "Order not found!" })
  return res.status(200).json(orderDetail);
}
