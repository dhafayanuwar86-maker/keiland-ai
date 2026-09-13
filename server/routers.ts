import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(12000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ai: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(chatMessageSchema).min(1).max(24) }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            model: "gpt-5-mini",
            messages: [
              {
                role: "system",
                content:
                  "Anda adalah Sahabat AI, asisten serbaguna untuk keseharian dan bisnis. Jawab dalam bahasa Indonesia kecuali diminta lain. Bantu pengguna berpikir, merencanakan, menulis, menganalisis, dan mengambil keputusan dengan langkah praktis. Gunakan Markdown ringan bila membantu. Jika informasi tidak pasti, katakan dengan jelas dan jangan mengarang fakta. Untuk keputusan medis, hukum, atau finansial yang penting, sarankan verifikasi profesional.",
              },
              ...input.messages,
            ],
          });

          const content = response.choices?.[0]?.message?.content;
          if (typeof content !== "string" || !content.trim()) {
            throw new Error("Model tidak mengembalikan jawaban teks.");
          }
          return { content };
        } catch (error) {
          console.error("[AI] Chat completion failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Maaf, Sahabat AI sedang mengalami kendala. Coba lagi sebentar.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
