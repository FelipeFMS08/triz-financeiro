import { sqliteTable, AnySQLiteColumn, foreignKey, text, integer, uniqueIndex, real } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const account = sqliteTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at"),
	refreshTokenExpiresAt: integer("refresh_token_expires_at"),
	scope: text(),
	password: text(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const session = sqliteTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: integer("expires_at").notNull(),
	token: text().notNull(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => [
	uniqueIndex("session_token_unique").on(table.token),
]);

export const transactions = sqliteTable("transactions", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	type: text().notNull(),
	description: text().notNull(),
	amount: real().notNull(),
	categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" } ),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	date: integer("date", { mode: "timestamp" }) 
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }) 
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer("email_verified").notNull(),
	image: text(),
	settings: text(), 
	createdAt: integer("created_at", { mode: "timestamp" }) 
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
	updatedAt: integer("updated_at").notNull(),
},
(table) => [
	uniqueIndex("user_email_unique").on(table.email),
]);

export const categories = sqliteTable("categories", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text().notNull(),
	threshold: real(),
	createdAt: integer("created_at", { mode: "timestamp" }) 
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

