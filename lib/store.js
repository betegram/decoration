import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { MongoClient } from "mongodb";
import { DEFAULT_CONFIG, loadConfig, saveConfig, mergeConfig } from "./config.js";

let root = "";
let client = null;
let db = null;

const COLLECTION = "settings";

export async function initStore(appRoot) {
  root = appRoot;
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.log("Store: local files (site-config.json)");
    return;
  }

  const dbName = process.env.MONGODB_DB?.trim() || "aurum_markets";
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log(`Store: MongoDB (${dbName})`);

  const site = await db.collection(COLLECTION).findOne({ _id: "site_config" });
  if (!site?.data) {
    const fromFile = existsSync(join(root, "site-config.json"))
      ? await loadConfig(root)
      : structuredClone(DEFAULT_CONFIG);
    await db.collection(COLLECTION).updateOne(
      { _id: "site_config" },
      { $set: { data: fromFile, updatedAt: new Date() } },
      { upsert: true }
    );
  }

  const auth = await db.collection(COLLECTION).findOne({ _id: "admin_auth" });
  if (!auth?.data) {
    const seed = {
      username: process.env.ADMIN_USERNAME?.trim() || "admin",
      password: process.env.ADMIN_PASSWORD || "aurum2026",
    };
    if (existsSync(join(root, "admin-auth.json"))) {
      try {
        const fileAuth = JSON.parse(await readFile(join(root, "admin-auth.json"), "utf8"));
        seed.username = fileAuth.username || seed.username;
        seed.password = fileAuth.password || seed.password;
      } catch {
        /* use env defaults */
      }
    }
    await db.collection(COLLECTION).updateOne(
      { _id: "admin_auth" },
      { $set: { data: seed, updatedAt: new Date() } },
      { upsert: true }
    );
  }
}

export async function loadSiteConfig() {
  if (db) {
    const doc = await db.collection(COLLECTION).findOne({ _id: "site_config" });
    if (doc?.data) return mergeConfig(DEFAULT_CONFIG, doc.data);
  }
  return loadConfig(root);
}

export async function saveSiteConfig(patch) {
  const clean = mergeConfig(DEFAULT_CONFIG, patch);
  if (db) {
    await db.collection(COLLECTION).updateOne(
      { _id: "site_config" },
      { $set: { data: clean, updatedAt: new Date() } },
      { upsert: true }
    );
    return clean;
  }
  return saveConfig(root, patch);
}

export async function loadAdminAuth() {
  if (db) {
    const doc = await db.collection(COLLECTION).findOne({ _id: "admin_auth" });
    if (doc?.data) return doc.data;
  }
  if (existsSync(join(root, "admin-auth.json"))) {
    return JSON.parse(await readFile(join(root, "admin-auth.json"), "utf8"));
  }
  return {
    username: process.env.ADMIN_USERNAME?.trim() || "admin",
    password: process.env.ADMIN_PASSWORD || "aurum2026",
  };
}

export async function closeStore() {
  if (client) await client.close();
}
