import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sqliteTable as authSqliteTable, text as authText } from "drizzle-orm/sqlite-core";

// Better Auth tables (automatically created by Better Auth)
export const users = authSqliteTable("auth_user", {
  id: authText("id").primaryKey(),
  name: authText("name").notNull(),
  email: authText("email").notNull().unique(),
  emailVerified: authText("emailVerified").default("false"),
  image: authText("image"),
  role: authText("role").default("kitchen"),
  createdAt: authText("createdAt").notNull(),
  updatedAt: authText("updatedAt").notNull(),
});

export const sessions = authSqliteTable("auth_session", {
  id: authText("id").primaryKey(),
  userId: authText("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: authText("token").notNull().unique(),
  expiresAt: authText("expiresAt").notNull(),
  ipAddress: authText("ipAddress"),
  userAgent: authText("userAgent"),
  createdAt: authText("createdAt").notNull(),
  updatedAt: authText("updatedAt").notNull(),
});

export const accounts = authSqliteTable("auth_account", {
  id: authText("id").primaryKey(),
  userId: authText("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: authText("accountId").notNull(),
  providerId: authText("providerId").notNull(),
  password: authText("password"),
  accessToken: authText("access_token"),
  refreshToken: authText("refresh_token"),
  accessTokenExpiresAt: authText("accessTokenExpiresAt"),
  refreshTokenExpiresAt: authText("refreshTokenExpiresAt"),
  scope: authText("scope"),
  idToken: authText("id_token"),
  createdAt: authText("createdAt").notNull(),
  updatedAt: authText("updatedAt").notNull(),
});

export const verifications = authSqliteTable("auth_verification", {
  id: authText("id").primaryKey(),
  identifier: authText("identifier").notNull(),
  value: authText("value").notNull(),
  expiresAt: authText("expiresAt").notNull(),
  createdAt: authText("createdAt").notNull(),
  updatedAt: authText("updatedAt").notNull(),
});

// Application tables
export const menuItems = sqliteTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  category: text("category").notNull(), // 'food', 'drink', 'dessert'
  preparationTime: integer("preparation_time").notNull().default(15), // minutes
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  customerName: text("customer_name"),
  customerAddress: text("customer_address"),
  customerPhone: text("customer_phone"),
  type: text("type").notNull().default("dine-in"), // 'dine-in', 'delivery', 'takeout'
  tableNumber: text("table_number"),
  total: real("total").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'preparing', 'ready', 'delivered'
  estimatedTime: integer("estimated_time"), // minutes
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: text("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(), // price at time of order
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// User settings (for client preferences)
export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;