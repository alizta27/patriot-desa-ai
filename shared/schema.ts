import { pgTable, text, uuid, timestamp, integer, pgEnum, numeric, serial, index } from 'drizzle-orm/pg-core';

export const appRoleEnum = pgEnum('app_role', ['aparatur', 'pendamping', 'bumdes', 'umum', 'admin']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['free', 'premium']);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  role: appRoleEnum('role'),
  phoneNumber: text('phone_number'),
  subscriptionStatus: text('subscription_status').notNull().default('free'),
  subscriptionExpiry: timestamp('subscription_expiry', { withTimezone: true }),
  lastPaymentId: text('last_payment_id'),
  paymentToken: text('payment_token'),
  usageCount: integer('usage_count').notNull().default(0),
  dailyUsageResetAt: timestamp('daily_usage_reset_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('New Chat'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }).unique(),
  plan: text('plan').notNull().default('free'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull().defaultNow(),
  endDate: timestamp('end_date', { withTimezone: true }),
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: appRoleEnum('role').notNull()
});

export const preRegistrations = pgTable('pre_registrations', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  emailIdx: index('idx_pre_registrations_email').on(table.email)
}));
