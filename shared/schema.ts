import { pgTable, uuid, text, timestamp, integer, numeric, pgEnum, boolean, serial, varchar, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const appRoleEnum = pgEnum('app_role', ['aparatur', 'pendamping', 'bumdes', 'umum', 'admin']);
export const activityTypeEnum = pgEnum('activity_type', ['login', 'query', 'subscription', 'profile_update', 'admin_action']);
export const messageCategoryEnum = pgEnum('message_category', ['administrasi', 'keuangan', 'bumdes', 'lainnya']);

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  role: appRoleEnum('role'),
  phoneNumber: text('phone_number'),
  subscriptionStatus: text('subscription_status').notNull().default('free'),
  subscriptionExpiry: timestamp('subscription_expiry', { withTimezone: true }),
  lastPaymentId: text('last_payment_id'),
  paymentToken: text('payment_token'),
  usageCount: integer('usage_count').notNull().default(0),
  dailyUsageResetAt: timestamp('daily_usage_reset_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

// Chats table
export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('New Chat'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  chatId: uuid('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  message: text('message').notNull(),
  category: messageCategoryEnum('category'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
}, (table) => ({
  categoryIdx: index('idx_chat_messages_category').on(table.category),
}));

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }).unique(),
  plan: text('plan').notNull().default('free'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull().default(sql`NOW()`),
  endDate: timestamp('end_date', { withTimezone: true }),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

// User roles table
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: appRoleEnum('role').notNull(),
});

// Pre-registrations table
export const preRegistrations = pgTable('pre_registrations', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`NOW()`),
}, (table) => ({
  emailIdx: index('idx_pre_registrations_email').on(table.email),
}));

// App settings table
export const appSettings = pgTable('app_settings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  siteName: text('site_name').notNull().default('Patriot Desa'),
  maintenanceMode: boolean('maintenance_mode').notNull().default(false),
  maxFreeQueries: integer('max_free_queries').notNull().default(5),
  subscriptionPrice: integer('subscription_price').notNull().default(99000),
  emailNotifications: boolean('email_notifications').notNull().default(true),
  autoBackup: boolean('auto_backup').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

// Activity logs table
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  details: text('details'),
  type: activityTypeEnum('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
}, (table) => ({
  createdAtIdx: index('idx_activity_logs_created_at').on(table.createdAt),
  userIdIdx: index('idx_activity_logs_user_id').on(table.userId),
}));

// Type exports for use in the application
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type NewAppSettings = typeof appSettings.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
