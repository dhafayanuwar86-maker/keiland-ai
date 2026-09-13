import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, listLLMModels } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const modeSchema = z.enum(["daily", "business", "marketing"]);
const chatMessageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(12000) });
const sourceSchema = z.object({ name: z.string().min(1).max(180), excerpt: z.string().min(1).max(9000) });

const modeInstructions = {
  daily: "Mode Keseharian: bantu rutinitas, belajar, keputusan pribadi, dan produktivitas dengan langkah sederhana.",
  business: "Mode Bisnis: fokus pada tujuan, pelanggan, angka, risiko, operasi, dan keputusan praktis.",
  marketing: "Mode Marketing: fokus pada audiens, positioning, pesan, channel, funnel, copywriting, dan metrik.",
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
    chat: publicProcedure.input(z.object({
      mode: modeSchema,
      memory: z.string().max(8000).optional(),
      sources: z.array(sourceSchema).max(8).optional(),
      messages: z.array(chatMessageSchema).min(1).max(24),
    })).mutation(async ({ input }) => {
      try {
        const catalog = await listLLMModels();
        const available = catalog.data.map((model) => model.id);
        const model = available.includes("gpt-5-mini") ? "gpt-5-mini" : available.find((id) => id.startsWith("gpt-5")) ?? available[0];
        const sourceContext = (input.sources ?? []).map((source, index) => `[Sumber ${index + 1}: ${source.name}]\n${source.excerpt}`).join("\n\n");
        const sourceNames = (input.sources ?? []).map((source) => source.name);
        const context = [modeInstructions[input.mode], input.memory ? `Memory yang disetujui pengguna:\n${input.memory}` : "", sourceContext ? `Knowledge base lokal. Gunakan hanya bila relevan dan sebutkan sumbernya:\n${sourceContext}` : ""].filter(Boolean).join("\n\n");
        const response = await invokeLLM({ model, messages: [{ role: "system", content: `Anda adalah Keiland AI 1.0, asisten serbaguna yang jujur dan praktis. Jawab dalam bahasa Indonesia kecuali diminta lain. ${context} Jangan mengarang fakta yang tidak ada di konteks. Jika sumber tidak cukup, katakan bahwa informasi belum ditemukan. Untuk keputusan medis, hukum, atau finansial penting, sarankan verifikasi profesional.` }, ...input.messages] });
        const content = response.choices?.[0]?.message?.content;
        if (typeof content !== "string" || !content.trim()) throw new Error("Empty model response");
        const citation = sourceNames.length ? `\n\n*Sumber konteks: ${sourceNames.join(", ")}*` : "";
        return { content: `${content}${citation}`, model: response.model, sources: sourceNames };
      } catch (error) {
        console.error("[AI] Chat completion failed:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Keiland AI sedang mengalami kendala. Coba lagi sebentar." });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
