// import fs from "fs";
import { Model } from "mongoose";
// import path from "path";

// const dbpath = path.join(__dirname, "..", "../data", "database.json");
// Helper to read/write
// export const getData = () => JSON.parse(fs.readFileSync(dbpath, "utf-8"));
// MongoDB
export const addData = async (db: Model<any>, data: any) => await db.create(data);
export const updateOneData = async (db: Model<any>, filter: any, data: any) => await db.findOneAndUpdate(filter, data);
export const updateManyData = async (db: Model<any>, filter: any, data: any) => await db.updateMany(filter, data);
export const deleteOneData = async (db: Model<any>, filter: any) => await db.findOneAndDelete(filter);
export const deleteManyData = async (db: Model<any>, filter: any) => await db.deleteMany(filter);
  // fs.writeFileSync(dbpath, JSON.stringify(data, null, 2));

export const stringToArray = (str: string): string[] => {
  return str
    ? str
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
};
