import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bot, Check, Copy, Lightbulb, MessageCircle, RotateCcw, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";

const starterMessages: Message[] = [
  {
    role: "system",
    content: "Anda sedang berbicara dengan Sahabat AI.",
  },
];

const promptCards = [
  { icon: Lightbulb, text: "Bantu saya menyusun rencana belajar" },
  { icon: WandSparkles, text: "Jelaskan konsep rumit dengan sederhana" },
  { icon: MessageCircle, text: "Buatkan ide konten untuk media sosial" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [copied, setCopied] = useState(false);
  const chatMutation = trpc.ai.chat.useMutation();

  useEffect(() => {
    const saved = localStorage.getItem("sahabat-ai-messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      } catch {
        localStorage.removeItem("sahabat-ai-messages");
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("sahabat-ai-messages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = (content: string) => {
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    chatMutation.mutate(
      {
        messages: nextMessages
          .filter((message) => message.role !== "system")
          .map((message) => ({ role: message.role as "user" | "assistant", content: message.content })),
      },
      {
        onSuccess: (response) => {
          setMessages((current) => [...current, { role: "assistant", content: response.content }]);
        },
      }
    );
  };

  const resetChat = () => {
    setMessages(starterMessages);
    localStorage.removeItem("sahabat-ai-messages");
  };

  const copyLastAnswer = async () => {
    const answer = [...messages].reverse().find((message) => message.role === "assistant");
    if (!answer) return;
    await navigator.clipboard.writeText(answer.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f4ef] text-[#1d2633]">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col lg:flex-row">
        <aside className="relative flex w-full shrink-0 flex-col justify-between overflow-hidden bg-[#182536] px-6 py-7 text-white lg:w-[310px] lg:px-8 lg:py-9">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#ef795f]/20 blur-3xl" />
          <div className="relative">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[#ef795f] shadow-lg shadow-[#ef795f]/20">
                <Sparkles className="size-5 text-white" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold tracking-tight">Sahabat AI</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Teman berpikir Anda</p>
              </div>
            </div>

            <div className="mb-10">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ef795f]">Workspace</p>
              <h1 className="font-display max-w-[220px] text-3xl font-semibold leading-[1.08] tracking-[-0.04em]">Mulai dari satu pertanyaan.</h1>
              <p className="mt-4 max-w-[230px] text-sm leading-6 text-white/60">Tulis apa pun yang sedang Anda pikirkan. Kita pecahkan bersama, langkah demi langkah.</p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/75"><Bot className="size-4 text-[#ef795f]" /> Model aktif</div>
                <p className="font-mono text-xs text-white/45">gpt-5-mini</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-300" /> Terhubung dan siap</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-xs leading-5 text-white/55">
                <p className="mb-2 font-medium text-white/80">Tips singkat</p>
                Berikan konteks, tujuan, dan format yang Anda inginkan agar jawaban lebih tepat.
              </div>
            </div>
          </div>

          <div className="relative mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/40">
            <span>Versi awal · 2026</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1">Beta</span>
          </div>
        </aside>

        <main className="flex min-h-[calc(100vh-1px)] min-w-0 flex-1 flex-col px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ef795f]">Ruang percakapan</p>
              <p className="mt-1 text-sm text-[#667181]">Privat di perangkat ini · Riwayat tersimpan lokal</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyLastAnswer} disabled={!messages.some((message) => message.role === "assistant")} className="hidden gap-2 text-[#667181] hover:bg-[#ebe5dc] hover:text-[#1d2633] sm:flex">
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                {copied ? "Tersalin" : "Salin jawaban"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetChat} className="gap-2 border-[#dcd5cb] bg-transparent text-[#667181] hover:bg-white hover:text-[#1d2633]">
                <RotateCcw className="size-4" /> <span className="hidden sm:inline">Percakapan baru</span><span className="sm:hidden">Baru</span>
              </Button>
            </div>
          </header>

          <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col pt-7 sm:pt-10">
            {messages.length <= 1 && (
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {promptCards.map(({ icon: Icon, text }) => (
                  <button key={text} onClick={() => handleSend(text)} className="group flex items-center gap-3 rounded-2xl border border-[#e4ddd3] bg-white/70 p-4 text-left text-sm text-[#586373] shadow-sm shadow-[#b7a994]/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ef795f]/50 hover:bg-white hover:shadow-md">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0eb] text-[#ef795f] transition-colors group-hover:bg-[#ef795f] group-hover:text-white"><Icon className="size-4" /></span>
                    <span className="leading-5">{text}</span>
                  </button>
                ))}
              </div>
            )}

            <AIChatBox
              messages={messages}
              onSendMessage={handleSend}
              isLoading={chatMutation.isPending}
              height="min(68vh, 650px)"
              placeholder="Tulis pesan untuk Sahabat AI..."
              emptyStateMessage="Sahabat AI siap mendengarkan"
              suggestedPrompts={[]}
              className="min-h-[470px] rounded-[26px] border-[#e4ddd3] bg-white shadow-[0_18px_60px_rgba(56,43,28,0.08)]"
            />
            {chatMutation.isError && <p className="mt-3 text-center text-xs text-red-600">{chatMutation.error.message}</p>}
            <p className="mt-4 text-center text-[11px] text-[#9a938b]">Sahabat AI dapat membuat kesalahan. Periksa kembali informasi penting.</p>
          </section>
        </main>
      </div>
    </div>
  );
}
