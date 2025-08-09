import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("client"), // client, provider, admin
  language: text("language").notNull().default("en"), // en, ar
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: varchar("provider_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => serviceCategories.id).notNull(),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceType: text("price_type").notNull().default("hourly"), // hourly, fixed, custom
  duration: integer("duration"), // in minutes
  location: text("location"),
  images: jsonb("images").default([]),
  availability: jsonb("availability").default({}),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, inactive
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  providerId: varchar("provider_id").references(() => users.id).notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  duration: integer("duration").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  clientAddress: text("client_address").notNull(),
  clientPhone: text("client_phone").notNull(),
  specialInstructions: text("special_instructions"),
  status: text("status").notNull().default("pending"), // pending, accepted, in_progress, completed, cancelled
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, refunded
  cancellationReason: text("cancellation_reason"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  clientId: varchar("client_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // booking, payment, system, etc.
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI-related tables
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  language: text("language").notNull().default("en"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => chatConversations.id).notNull(),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  serviceIds: jsonb("service_ids").notNull(), // array of recommended service IDs
  reason: text("reason"), // AI reasoning for recommendations
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // confidence score 0-1
  userFeedback: text("user_feedback"), // positive, negative, neutral
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sentimentAnalysis = pgTable("sentiment_analysis", {
  id: serial("id").primaryKey(),
  referenceType: text("reference_type").notNull(), // review, message, feedback
  referenceId: integer("reference_id").notNull(),
  sentiment: text("sentiment").notNull(), // positive, negative, neutral
  score: decimal("score", { precision: 4, scale: 3 }), // sentiment score -1 to 1
  keywords: jsonb("keywords").default([]),
  processedAt: timestamp("processed_at").defaultNow(),
});

// Additional tables for comprehensive backend
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  businessDocs: jsonb("business_docs").default([]), // URLs to documents
  approvalStatus: text("approval_status").notNull().default("pending"), // pending, approved, rejected
  ratings: decimal("ratings", { precision: 3, scale: 2 }).default("0.00"),
  serviceCount: integer("service_count").default(0),
  city: text("city"),
  businessType: text("business_type"),
  licenseNumber: text("license_number"),
  insuranceInfo: jsonb("insurance_info").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00"),
  currency: text("currency").notNull().default("USD"),
  lastTransactionAt: timestamp("last_transaction_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  providerId: varchar("provider_id").references(() => users.id).notNull(),
  method: text("method").notNull(), // stripe, paypal, applepay, wallet
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending, paid, refunded, failed
  txnId: text("txn_id"), // external transaction ID
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  refundReason: text("refund_reason"),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).default("0.00"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiLogs = pgTable("ai_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"),
  query: text("query").notNull(),
  response: text("response").notNull(),
  intent: text("intent"), // search, book, recommend, chat
  serviceMatchedId: integer("service_matched_id").references(() => services.id),
  language: text("language").default("en"),
  processingTime: integer("processing_time"), // in milliseconds
  model: text("model"), // gpt-4, claude, etc.
  tokens: integer("tokens"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Enhanced services table updates
export const serviceImages = pgTable("service_images", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  imageUrl: text("image_url").notNull(),
  alt: text("alt"),
  isPrimary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced tables with additional fields
export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => serviceCategories.id).notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull(),
  deviceInfo: jsonb("device_info").default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  emailType: text("email_type").notNull(), // welcome, booking_confirmation, password_reset, etc.
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, failed, bounced
  provider: text("provider"), // sendgrid, mailgun, etc.
  externalId: text("external_id"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const smsLogs = pgTable("sms_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  smsType: text("sms_type").notNull(), // booking_confirmation, otp, reminder, etc.
  status: text("status").notNull().default("pending"), // pending, sent, failed
  provider: text("provider"), // twilio, etc.
  externalId: text("external_id"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(), // info, warn, error, debug
  category: text("category").notNull(), // auth, payment, ai, booking, etc.
  message: text("message").notNull(),
  metadata: jsonb("metadata").default({}),
  userId: varchar("user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertSentimentAnalysisSchema = createInsertSchema(sentimentAnalysis).omit({
  id: true,
  processedAt: true,
});

// Additional insert schemas
export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiLogSchema = createInsertSchema(aiLogs).omit({
  id: true,
  timestamp: true,
});

export const insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSmsLogSchema = createInsertSchema(smsLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  createdAt: true,
});

export const insertServiceImageSchema = createInsertSchema(serviceImages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type SentimentAnalysis = typeof sentimentAnalysis.$inferSelect;
export type InsertSentimentAnalysis = z.infer<typeof insertSentimentAnalysisSchema>;

// Additional types
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type AiLog = typeof aiLogs.$inferSelect;
export type InsertAiLog = z.infer<typeof insertAiLogSchema>;
export type Subcategory = typeof subcategories.$inferSelect;
export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type SmsLog = typeof smsLogs.$inferSelect;
export type InsertSmsLog = z.infer<typeof insertSmsLogSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type ServiceImage = typeof serviceImages.$inferSelect;
export type InsertServiceImage = z.infer<typeof insertServiceImageSchema>;
