import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { z } from "zod";
import { quizzes, quizQuestions, userQuizProgress, devices, suggestions, announcements, updateRequests, chatMessages, collaborationSessions, collaborationParticipants, trafficThreads } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  quiz: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(quizzes).limit(20);
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const quiz = await db.select().from(quizzes).where(eq(quizzes.id, input.id)).limit(1);
      if (!quiz.length) return null;
      const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, input.id));
      return { ...quiz[0], questions };
    }),
    getProgress: protectedProcedure.input(z.object({ quizId: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const progress = await db.select().from(userQuizProgress).where(and(eq(userQuizProgress.userId, ctx.user.id), eq(userQuizProgress.quizId, input.quizId))).limit(1);
      return progress.length > 0 ? progress[0] : null;
    }),
    submitAnswer: protectedProcedure.input(z.object({ quizId: z.number(), questionId: z.number(), answer: z.number(), isCorrect: z.boolean() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const existing = await db.select().from(userQuizProgress).where(and(eq(userQuizProgress.userId, ctx.user.id), eq(userQuizProgress.quizId, input.quizId))).limit(1);
      if (existing.length > 0) {
        const newScore = (existing[0].score || 0) + (input.isCorrect ? 1 : 0);
        await db.update(userQuizProgress).set({ score: newScore, totalQuestions: (existing[0].totalQuestions || 0) + 1 }).where(eq(userQuizProgress.id, existing[0].id));
      } else {
        await db.insert(userQuizProgress).values({ userId: ctx.user.id, quizId: input.quizId, score: input.isCorrect ? 1 : 0, totalQuestions: 1, startedAt: new Date() });
      }
      return { success: true };
    }),
    completeQuiz: protectedProcedure.input(z.object({ quizId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(userQuizProgress).set({ completed: 1, completedAt: new Date() }).where(and(eq(userQuizProgress.userId, ctx.user.id), eq(userQuizProgress.quizId, input.quizId)));
      return { success: true };
    }),
  }),

  device: router({
    register: protectedProcedure.input(z.object({ deviceCode: z.string(), deviceName: z.string().optional(), deviceData: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      try {
        await db.insert(devices).values({ userId: ctx.user.id, deviceCode: input.deviceCode, deviceName: input.deviceName, deviceData: input.deviceData });
        return { success: true, deviceCode: input.deviceCode };
      } catch {
        return { success: false, error: "Device already registered" };
      }
    }),
    getByCode: protectedProcedure.input(z.object({ deviceCode: z.string() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const device = await db.select().from(devices).where(and(eq(devices.userId, ctx.user.id), eq(devices.deviceCode, input.deviceCode))).limit(1);
      if (device.length > 0) {
        await db.update(devices).set({ lastAccessedAt: new Date() }).where(eq(devices.id, device[0].id));
        return device[0];
      }
      return null;
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(devices).where(eq(devices.userId, ctx.user.id));
    }),
  }),

  suggestion: router({
    create: protectedProcedure.input(z.object({ title: z.string(), description: z.string(), category: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(suggestions).values({ userId: ctx.user.id, title: input.title, description: input.description, category: input.category });
      return { success: true };
    }),
    list: publicProcedure.input(z.object({ status: z.string().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.status) return await db.select().from(suggestions).where(eq(suggestions.status, input.status as any)).orderBy(desc(suggestions.votes));
      return await db.select().from(suggestions).orderBy(desc(suggestions.votes));
    }),
    vote: publicProcedure.input(z.object({ suggestionId: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const suggestion = await db.select().from(suggestions).where(eq(suggestions.id, input.suggestionId)).limit(1);
      if (suggestion.length > 0) {
        await db.update(suggestions).set({ votes: (suggestion[0].votes || 0) + 1 }).where(eq(suggestions.id, input.suggestionId));
        return { success: true };
      }
      return { success: false };
    }),
  }),

  announcement: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(announcements).where(eq(announcements.published, 1)).orderBy(desc(announcements.createdAt));
    }),
    create: protectedProcedure.input(z.object({ title: z.string(), content: z.string(), priority: z.enum(["low", "medium", "high"]).optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || ctx.user.role !== "admin") return { success: false, error: "Unauthorized" };
      await db.insert(announcements).values({ adminId: ctx.user.id, title: input.title, content: input.content, priority: input.priority || "medium" });
      return { success: true };
    }),
    publish: protectedProcedure.input(z.object({ announcementId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || ctx.user.role !== "admin") return { success: false, error: "Unauthorized" };
      await db.update(announcements).set({ published: 1 }).where(eq(announcements.id, input.announcementId));
      return { success: true };
    }),
  }),

  updateRequest: router({
    create: protectedProcedure.input(z.object({ itemType: z.string(), itemId: z.string(), changes: z.string() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(updateRequests).values({ userId: ctx.user.id, itemType: input.itemType, itemId: input.itemId, changes: input.changes });
      return { success: true };
    }),
    list: publicProcedure.input(z.object({ status: z.string().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.status) return await db.select().from(updateRequests).where(eq(updateRequests.status, input.status as any));
      return await db.select().from(updateRequests);
    }),
    approve: protectedProcedure.input(z.object({ requestId: z.number(), reason: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || ctx.user.role !== "admin") return { success: false, error: "Unauthorized" };
      await db.update(updateRequests).set({ status: "approved", approvedBy: ctx.user.id, approvedAt: new Date() }).where(eq(updateRequests.id, input.requestId));
      return { success: true };
    }),
    reject: protectedProcedure.input(z.object({ requestId: z.number(), reason: z.string() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || ctx.user.role !== "admin") return { success: false, error: "Unauthorized" };
      await db.update(updateRequests).set({ status: "rejected", reason: input.reason }).where(eq(updateRequests.id, input.requestId));
      return { success: true };
    }),
  }),

  chat: router({
    sendMessage: protectedProcedure.input(z.object({ roomId: z.string(), message: z.string() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(chatMessages).values({ userId: ctx.user.id, roomId: input.roomId, message: input.message });
      return { success: true };
    }),
    getMessages: publicProcedure.input(z.object({ roomId: z.string(), limit: z.number().optional() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const messages = await db.select().from(chatMessages).where(eq(chatMessages.roomId, input.roomId)).orderBy(desc(chatMessages.createdAt)).limit(input.limit || 50);
      return messages.reverse();
    }),
  }),

  collaboration: router({
    createSession: protectedProcedure.input(z.object({ title: z.string().optional(), data: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const sessionCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      await db.insert(collaborationSessions).values({ sessionCode, title: input.title, creatorId: ctx.user.id, data: input.data });
      return { success: true, sessionCode };
    }),
    joinSession: protectedProcedure.input(z.object({ sessionCode: z.string() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const session = await db.select().from(collaborationSessions).where(eq(collaborationSessions.sessionCode, input.sessionCode)).limit(1);
      if (!session.length) return { success: false, error: "Session not found" };
      try {
        await db.insert(collaborationParticipants).values({ sessionId: session[0].id, userId: ctx.user.id });
        await db.update(collaborationSessions).set({ activeUsers: (session[0].activeUsers || 1) + 1 }).where(eq(collaborationSessions.id, session[0].id));
        return { success: true, session: session[0] };
      } catch {
        return { success: false, error: "Already in session" };
      }
    }),
    getSession: publicProcedure.input(z.object({ sessionCode: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const session = await db.select().from(collaborationSessions).where(eq(collaborationSessions.sessionCode, input.sessionCode)).limit(1);
      return session.length > 0 ? session[0] : null;
    }),
    updateSessionData: protectedProcedure.input(z.object({ sessionId: z.number(), data: z.string() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(collaborationSessions).set({ data: input.data, updatedAt: new Date() }).where(eq(collaborationSessions.id, input.sessionId));
      return { success: true };
    }),
  }),

  traffic: router({
    createThread: publicProcedure.input(z.object({ capacity: z.number().optional() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const threadId = `thread_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await db.insert(trafficThreads).values({ threadId, capacity: input.capacity || 100 });
      return { success: true, threadId };
    }),
    getActiveThreads: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(trafficThreads).where(eq(trafficThreads.status, "active")).limit(10);
    }),
    updateThreadLoad: publicProcedure.input(z.object({ threadId: z.string(), load: z.number() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const thread = await db.select().from(trafficThreads).where(eq(trafficThreads.threadId, input.threadId)).limit(1);
      if (thread.length > 0) {
        if (input.load >= (thread[0].capacity || 100)) {
          await db.update(trafficThreads).set({ status: "idle" }).where(eq(trafficThreads.id, thread[0].id));
        } else {
          await db.update(trafficThreads).set({ currentLoad: input.load }).where(eq(trafficThreads.id, thread[0].id));
        }
      }
      return { success: true };
    }),
    closeThread: publicProcedure.input(z.object({ threadId: z.string() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(trafficThreads).set({ status: "closed" }).where(eq(trafficThreads.threadId, input.threadId));
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
