import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Quiz Tables
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull().references(() => quizzes.id),
  question: text("question").notNull(),
  options: text("options").notNull(),
  correctAnswer: int("correctAnswer").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userQuizProgress = mysqlTable("user_quiz_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  quizId: int("quizId").notNull().references(() => quizzes.id),
  score: int("score").default(0),
  totalQuestions: int("totalQuestions").default(0),
  completed: int("completed").default(0),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Device Recognition
export const devices = mysqlTable("devices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  deviceCode: varchar("deviceCode", { length: 64 }).notNull().unique(),
  deviceName: varchar("deviceName", { length: 255 }),
  deviceData: text("deviceData"),
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Suggestions
export const suggestions = mysqlTable("suggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "implemented"]).default("pending"),
  votes: int("votes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Announcements (admin-only)
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  published: int("published").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Update Requests (admin approval)
export const updateRequests = mysqlTable("update_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  itemType: varchar("itemType", { length: 100 }).notNull(),
  itemId: varchar("itemId", { length: 255 }).notNull(),
  changes: text("changes").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  approvedBy: int("approvedBy").references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
});

// Chat Messages
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  roomId: varchar("roomId", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Real-time Collaboration
export const collaborationSessions = mysqlTable("collaboration_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionCode: varchar("sessionCode", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }),
  creatorId: int("creatorId").notNull().references(() => users.id),
  activeUsers: int("activeUsers").default(1),
  data: text("data"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export const collaborationParticipants = mysqlTable("collaboration_participants", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => collaborationSessions.id),
  userId: int("userId").notNull().references(() => users.id),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  lastActiveAt: timestamp("lastActiveAt").defaultNow(),
});

// Traffic Distribution (Thread Management)
export const trafficThreads = mysqlTable("traffic_threads", {
  id: int("id").autoincrement().primaryKey(),
  threadId: varchar("threadId", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "idle", "closed"]).default("active"),
  capacity: int("capacity").default(100),
  currentLoad: int("currentLoad").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrafficThread = typeof trafficThreads.$inferSelect;

export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type UserQuizProgress = typeof userQuizProgress.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type Suggestion = typeof suggestions.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type UpdateRequest = typeof updateRequests.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type CollaborationSession = typeof collaborationSessions.$inferSelect;