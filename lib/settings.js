import dbModule from "./db";
import SiteSettings from "../models/SiteSettings";

async function ensureDB() {
  const db = dbModule?.default ?? dbModule;
  if (typeof db === "function") return db();
  if (db && typeof db.connect === "function") return db.connect();
  return null;
}

export async function getSiteSettings() {
  await ensureDB();
  let s = await SiteSettings.findOne({}, null, { sort: { createdAt: -1 } });
  if (!s) s = await SiteSettings.create({});
  return s;
}
