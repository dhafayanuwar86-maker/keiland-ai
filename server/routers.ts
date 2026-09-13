import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const modeSchema = z.enum(["daily", "business", "marketing"]);
const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(12000),
});

const modeInstructions = {
  daily: "Mode Keseharian: bantu rutinitas, belajar, keputusan pribadi, produktivitas, dan perencanaan dengan bahasa hangat dan langkah sederhana.",
  business: "Mode Bisnis: fokus pada tujuan, angka, risiko, pelanggan, operasi, dan keputusan praktis. Gunakan struktur ringkas dan asumsi yang dinyatakan.",
  marketing: "Mode Marketing: fokus pada audiens, positioning, pesan, channel, funnel, copywriting, dan ide yang dapat diuji. Berikan contoh konkret dan metrik keberhasilan.",
} as const;

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
      .input(
        z.object({
          mode: modeSchema,
          memory: z.string().max(6000).optional(),
          documentContext: z.string().max(18000).optional(),
          messages: z.array(chatMessageSchema).min(1).max(24),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const catalog = await listLLMModels();
          const available = catalog.data.map((model) => model.id);
          const model = available.includes("gpt-5-mini")
            ? "gpt-5-mini"
            : available.find((id) => id.startsWith("gpt-5")) ?? available[0];
          const contextBlocks = [
            modeInstructions[input.mode],
            input.memory ? `Memory yang disetujui pengguna:\n${input.memory}` : "",
            input.documentContext ? `Dokumen yang dipilih pengguna:\n${input.documentContext}` : "",
          ].filter(Boolean).join("\n\n");
          const response = await invokeLLM({
            model,
            messages: [
              {
                role: "system",
                content: `Anda adalah Keiland AI 1.0, asisten serbaguna yang cerdas, jujur, dan praktis. Jawab dalam bahasa Indonesia kecuali diminta lain. ${contextBlocks} Gunakan Markdown ringan bila membantu. Jika informasi tidak pasti, katakan dengan jelas dan jangan mengarang fakta. Untuk keputusan medis, hukum, atau finansial yang penting, sarankan verifikasi profesional.`,
              },
              ...input.messages,
            ],
          });
          const content = response.choices?.[0]?.message?.content;
          if (typeof content !== "string" || !content.trim()) throw new Error("Empty model response");
          return { content, model: response.model };
        } catch (error) {
          console.error("[AI] Chat completion failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Keiland AI sedang mengalami kendala. Coba lagi sebentar." });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
