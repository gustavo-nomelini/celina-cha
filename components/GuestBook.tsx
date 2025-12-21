'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, type FormEvent } from 'react';
import { GlowSubmitButton } from './Sparkles';

const easeOut = [0.22, 1, 0.36, 1] as const;

type Guest = {
  id: string;
  name: string;
  message: string;
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
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  async function fetchGuests() {
    setLoading(true);
    try {
      const res = await fetch('/api/recados');
      const json: ApiResponse<Guest[]> = await res.json();

      if (json.ok && json.data) {
        setGuests(json.data);
      } else {
        console.error('Erro ao buscar recados:', json.error?.message);
      }
    } catch (error) {
      console.error('Erro ao buscar recados:', error);
    }
    setLoading(false);
  }

  useEffect(() => {
    void fetchGuests();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedMessage) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/recados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
      });
      const json: ApiResponse<Guest> = await res.json();

      if (json.ok && json.data) {
        setGuests((prev) => [json.data!, ...prev]);
        setName('');
        setMessage('');
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
            {loading ? 'carregando...' : `${guests.length} recados`}
          </div>
        </div>
        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-text/60">Carregando recados...</div>
          ) : guests.length === 0 ? (
            <div className="py-8 text-center text-sm text-text/60">
              Seja o primeiro a deixar um recado! 💛
            </div>
          ) : (
            guests.map((guest) => (
              <motion.div
                key={guest.id}
                className="rounded-2xl bg-primaryLight/80 px-4 py-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
                whileHover={{ y: -1 }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-bold">{guest.name}</div>
                  <div className="text-xs text-text/50">{formatDate(guest.createdAt)}</div>
                </div>
                <div className="mt-1 text-sm text-text/80">{guest.message}</div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
