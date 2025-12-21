'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, type FormEvent } from 'react';
import { GlowSubmitButton } from './Sparkles';

const easeOut = [0.22, 1, 0.36, 1] as const;

type Message = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: { message: string };
};

type GuestBookProps = {
  onToast?: (toast: { title: string; description?: string; tone?: 'success' | 'info' }) => void;
};

export function GuestBook({ onToast }: GuestBookProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await fetch('/api/recados');
      const json: ApiResponse<Message[]> = await res.json();

      if (json.ok && json.data) {
        setMessages(json.data);
      } else {
        console.error('Erro ao buscar recados:', json.error?.message);
      }
    } catch (error) {
      console.error('Erro ao buscar recados:', error);
    }
    setLoading(false);
  }

  useEffect(() => {
    void fetchMessages();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedContent = content.trim();

    if (!trimmedName || !trimmedContent) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/recados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, content: trimmedContent }),
      });
      const json: ApiResponse<Message> = await res.json();

      if (json.ok && json.data) {
        setMessages((prev) => [json.data!, ...prev]);
        setName('');
        setContent('');
        onToast?.({ title: 'Recado publicado!', tone: 'success' });
      } else {
        onToast?.({ title: 'Erro ao enviar', description: json.error?.message, tone: 'info' });
      }
    } catch (error) {
      console.error('Erro ao enviar recado:', error);
      onToast?.({ title: 'Erro ao enviar', description: 'Tente novamente', tone: 'info' });
    }

    setSubmitting(false);
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-text/10 bg-background/90 p-6 shadow-[0_18px_50px_-34px_rgba(90,70,52,0.5)]"
      >
        <label className="block">
          <span className="text-sm font-semibold">Seu nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-11 w-full rounded-2xl border border-text/15 bg-background px-4 text-sm outline-none placeholder:text-text/40 focus:border-accent"
            placeholder="Como você quer assinar"
            maxLength={100}
            required
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold">Mensagem</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="mt-2 w-full resize-none rounded-2xl border border-text/15 bg-background px-4 py-3 text-sm outline-none placeholder:text-text/40 focus:border-accent"
            placeholder="Escreva um recadinho..."
            required
          />
        </label>
        <GlowSubmitButton
          className="mt-5 h-11 w-full px-6 text-sm"
          bgColor="bg-primary"
          glowColor="rgba(246, 196, 83, 0.7)"
        >
          {submitting ? '⏳ Enviando...' : '💌 Publicar'}
        </GlowSubmitButton>
      </form>

      <div className="rounded-3xl border border-text/10 bg-background/90 p-6 shadow-[0_18px_50px_-34px_rgba(90,70,52,0.5)]">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-text/70">
            Últimos recados
          </div>
          <div className="text-xs text-text/70">
            {loading ? 'carregando...' : `${messages.length} recados`}
          </div>
        </div>
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-text/60">Carregando recados...</div>
          ) : messages.length === 0 ? (
            <div className="py-8 text-center text-sm text-text/60">
              Seja o primeiro a deixar um recado! 💛
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                className="rounded-2xl bg-primaryLight/80 px-4 py-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
                whileHover={{ y: -1 }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-bold">{msg.name}</div>
                  <div className="text-xs text-text/50">{formatDate(msg.createdAt)}</div>
                </div>
                <div className="mt-1 text-sm text-text/80">{msg.content}</div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
