'use client';

import { GuestBook } from '@/components/GuestBook';
import { SectionDivider } from '@/components/SectionDivider';
import { GlowButton, GlowSubmitButton } from '@/components/Sparkles';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function format2(n: number) {
  return String(n).padStart(2, '0');
}

function diffToCountdown(targetMs: number, nowMs: number): Countdown {
  const total = Math.max(0, targetMs - nowMs);
  const seconds = Math.floor(total / 1000);
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = seconds % 60;
  return { days, hours, minutes, seconds: secs };
}

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone?: 'success' | 'info';
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export default function Home() {
  const eventDate = useMemo(() => {
    // Ajuste depois com a data real do evento.
    // Formato: ano, mês-1, dia, hora, minuto
    return new Date(2026, 0, 17, 15, 0);
  }, []);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.4,
  });

  const [countdown, setCountdown] = useState<Countdown>(() =>
    diffToCountdown(eventDate.getTime(), Date.now())
  );

  const [rsvpName, setRsvpName] = useState('');
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpNote, setRsvpNote] = useState('');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(diffToCountdown(eventDate.getTime(), Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [eventDate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const pushToast = (toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next: Toast = { id, ...toast };
    setToasts((prev) => [next, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const onSubmitRsvp = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/confirmacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rsvpName.trim(),
          quantity: rsvpGuests,
          note: rsvpNote.trim() || undefined,
        }),
      });
      const json = await res.json();

      if (json.ok) {
        setRsvpName('');
        setRsvpGuests(1);
        setRsvpNote('');
        pushToast({
          title: 'Presença confirmada!',
          description: 'Obrigado por responder.',
          tone: 'success',
        });
      } else {
        pushToast({
          title: 'Erro ao confirmar',
          description: json.error?.message || 'Tente novamente',
          tone: 'info',
        });
      }
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      pushToast({
        title: 'Erro ao confirmar',
        description: 'Tente novamente',
        tone: 'info',
      });
    }
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  const openAddressOnMaps = () => {
    const address = 'Rua Plínio Salgado, 549';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = url;
    }
    pushToast({
      title: 'Abrindo no Google Maps',
      description: address,
      tone: 'success',
    });
  };

  return (
    <div className="relative isolate min-h-dvh bg-primaryLight text-text">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 h-112 w-md -translate-x-1/2 rounded-full bg-primary/35 blur-3xl" />
        <div className="absolute top-28 left-6 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-112 w-md rounded-full bg-success/25 blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-b from-background/70 via-primaryLight/40 to-primaryLight" />
      </div>

      <AnimatePresence>
        {toasts.length > 0 && (
          <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-3">
            <AnimatePresence initial={false}>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="pointer-events-auto w-70 rounded-2xl border border-text/10 bg-primaryLight/80 p-4 shadow-lg backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold">{t.title}</div>
                      {t.description ? (
                        <div className="mt-1 text-xs text-text/70">{t.description}</div>
                      ) : null}
                    </div>
                    <div
                      className={
                        t.tone === 'success'
                          ? 'h-2.5 w-2.5 rounded-full bg-success'
                          : 'h-2.5 w-2.5 rounded-full bg-accent'
                      }
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-30 border-b border-text/10 bg-background/70 backdrop-blur">
        <motion.div className="h-0.75 origin-left bg-primary" style={{ scaleX: progress }} />
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <motion.button
            type="button"
            onClick={() => scrollToId('top')}
            className="flex items-baseline gap-2"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Voltar ao topo"
          >
            <span className="font-display text-xl font-bold tracking-tight">Celina</span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text/70">
              chá de bebê
            </span>
          </motion.button>

          <nav className="hidden items-center gap-3 text-sm sm:flex">
            {[
              { id: 'detalhes', label: 'Detalhes' },
              { id: 'rsvp', label: 'Confirmação' },
              { id: 'presentes', label: 'Presentes' },
              { id: 'recados', label: 'Recados' },
            ].map((item) => (
              <GlowButton
                key={item.id}
                onClick={() => scrollToId(item.id)}
                variant="nav"
                className="px-3 py-2"
              >
                {item.label}
              </GlowButton>
            ))}
          </nav>

          <motion.button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-text/15 bg-background/70 px-4 text-sm font-bold text-text sm:hidden"
            whileTap={{ scale: 0.98 }}
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
          >
            Menu
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-40 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/25"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute right-3 top-3 w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-text/10 bg-background/95 shadow-xl"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: easeOut }}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div className="font-display text-lg font-bold">Navegação</div>
                <motion.button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-text/15 bg-primaryLight/60 px-3 py-1 text-sm font-bold"
                  whileTap={{ scale: 0.98 }}
                >
                  Fechar
                </motion.button>
              </div>
              <div className="px-3 pb-4">
                {[
                  { id: 'detalhes', label: 'Detalhes do evento' },
                  { id: 'rsvp', label: 'Confirmação de presença' },
                  { id: 'presentes', label: 'Lista de presentes' },
                  { id: 'recados', label: 'Mural de recados' },
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToId(item.id)}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold text-text hover:bg-primaryLight/60"
                    whileTap={{ scale: 0.99 }}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs font-semibold text-text/60">Ir</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main id="top" className="mx-auto w-full max-w-5xl px-4 pb-20">
        <motion.section
          className="relative pt-10 sm:pt-14"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-6 top-8 h-28 w-28 rounded-full bg-accent/25 blur-2xl" />
            <div className="absolute right-6 top-16 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute bottom-0 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-success/25 blur-2xl" />
          </div>

          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                Chá de Bebê da Celina
              </h1>
              <p className="mt-4 max-w-prose text-base leading-7 text-text/80">
                Você é nosso convidado especial para celebrar a chegada da nossa menina. Preparamos
                um convite leve, bonito e prático — com tudo em um só lugar.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <GlowButton
                  onClick={() => scrollToId('rsvp')}
                  variant="primary"
                  className="h-11 px-6 text-sm"
                >
                  ✨ Confirmar presença
                </GlowButton>
                <GlowButton
                  onClick={() => scrollToId('presentes')}
                  variant="secondary"
                  className="h-11 px-6 text-sm"
                >
                  🎁 Ver lista de presentes
                </GlowButton>
              </div>
            </div>

            <motion.div
              className="rounded-3xl border border-text/10 bg-background/90 p-6 shadow-[0_18px_50px_-30px_rgba(90,70,52,0.55)] backdrop-blur"
              variants={scaleIn}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-2xl font-bold">Contagem regressiva</h2>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text/70">
                  até o grande dia
                </span>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-3">
                {(
                  [
                    { label: 'Dias', value: String(countdown.days) },
                    { label: 'Horas', value: format2(countdown.hours) },
                    { label: 'Min', value: format2(countdown.minutes) },
                    { label: 'Seg', value: format2(countdown.seconds) },
                  ] as const
                ).map((item) => (
                  <motion.div
                    key={item.label}
                    className="rounded-2xl bg-primaryLight/80 px-3 py-4 text-center"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="font-display text-3xl font-bold leading-none">{item.value}</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-text/70">
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-text/10 bg-background px-4 py-3">
                <div className="text-sm font-semibold">Data</div>
                <div className="text-sm text-text/80">
                  {eventDate.toLocaleString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <SectionDivider variant="star" />

        <motion.section
          id="detalhes"
          className="scroll-mt-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl font-bold">Detalhes do evento</h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <motion.div
              className="rounded-3xl border border-text/10 bg-background/90 p-6 shadow-[0_18px_50px_-34px_rgba(90,70,52,0.5)]"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-text/70">
                Quando
              </div>
              <div className="mt-2 font-display text-xl font-bold">17/01/2026</div>
              <div className="mt-1 text-sm text-text/80">15:00</div>
            </motion.div>
            <motion.div
              className="rounded-3xl border border-text/10 bg-background/90 p-6 shadow-[0_18px_50px_-34px_rgba(90,70,52,0.5)]"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-text/70">Onde</div>
              <div className="mt-2 font-display text-xl font-bold">Espaço</div>
              <div className="mt-1 text-sm text-text/80">Rua Plínio Salgado, 549</div>
              <motion.button
                type="button"
                onClick={openAddressOnMaps}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-full border border-text/15 bg-primary px-4 text-xs font-bold text-text"
                whileTap={{ scale: 0.98 }}
              >
                Abrir no Google Maps
              </motion.button>
            </motion.div>
            <motion.div
              className="rounded-3xl border border-text/10 bg-background/90 p-6 shadow-[0_18px_50px_-34px_rgba(90,70,52,0.5)]"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-text/70">
                Dress code
              </div>
              <div className="mt-2 font-display text-xl font-bold">Confortável</div>
            </motion.div>
          </div>

          {/* Card especial - O que teremos na festa */}
          <motion.div
            className="relative mt-6 overflow-hidden rounded-3xl border-2 border-primary/40 bg-linear-to-br from-primary/10 via-background/95 to-accent/10 p-8 shadow-[0_24px_60px_-20px_rgba(246,196,83,0.35)]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: easeOut }}
            whileHover={{ y: -3, boxShadow: '0 28px 70px -20px rgba(246,196,83,0.45)' }}
          >
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
            <div className="pointer-events-none absolute right-1/4 top-1/2 h-20 w-20 rounded-full bg-success/15 blur-xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/30 text-xl">
                  ✨
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Especial
                  </div>
                  <h3 className="font-display text-2xl font-bold">O que teremos na festa</h3>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  {
                    emoji: '🍽️',
                    title: 'Comidas e bebidas',
                    desc: 'Preparado com amor pelos papais',
                  },
                  {
                    emoji: '🍰',
                    title: 'Mesa de doces',
                    desc: 'Delícias preparadas com carinho',
                  },
                  {
                    emoji: '📸',
                    title: 'Cantinho de fotos',
                    desc: 'Cenário especial para registros',
                  },
                  {
                    emoji: '🎮',
                    title: 'Brincadeiras',
                    desc: 'Diversão garantida para todos',
                  },
                  {
                    emoji: '🎁',
                    title: 'Lembrancinhas',
                    desc: 'Um mimo para levar pra casa',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="group relative rounded-2xl border border-text/10 bg-background/80 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-background/95"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: easeOut }}
                    whileHover={{ y: -2, scale: 1.02 }}
                  >
                    <div className="absolute -right-1 -top-1 h-8 w-8 rounded-full bg-primary/10 opacity-0 blur-lg transition-opacity group-hover:opacity-100" />
                    <div className="mb-3 text-3xl">{item.emoji}</div>
                    <div className="font-display text-base font-bold leading-tight">
                      {item.title}
                    </div>
                    <div className="mt-1.5 text-xs leading-relaxed text-text/70">{item.desc}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-center">
                <span className="text-sm text-text/60">E muito mais surpresas</span>
                <span className="animate-pulse text-lg">💛</span>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <SectionDivider variant="flower" />

        <motion.section
          id="rsvp"
          className="scroll-mt-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h2 className="font-display text-3xl font-bold">Confirmação de presença</h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-text/80">
            Preencha abaixo para confirmar sua presença :
          </p>

          <form
            onSubmit={onSubmitRsvp}
            className="mt-6 rounded-3xl border border-text/10 bg-background/90 p-6 shadow-[0_18px_50px_-34px_rgba(90,70,52,0.5)]"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Nome</span>
                <input
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  className="mt-2 h-11 w-full rounded-2xl border border-text/15 bg-background px-4 text-sm outline-none placeholder:text-text/40 focus:border-primary"
                  placeholder="Seu nome"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Convidados</span>
                <input
                  value={rsvpGuests}
                  onChange={(e) => setRsvpGuests(Number(e.target.value))}
                  type="number"
                  min={1}
                  className="mt-2 h-11 w-full rounded-2xl border border-text/15 bg-background px-4 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-semibold">Observações</span>
              <textarea
                value={rsvpNote}
                onChange={(e) => setRsvpNote(e.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-text/15 bg-background px-4 py-3 text-sm outline-none placeholder:text-text/40 focus:border-primary"
                placeholder="Deixe um recadinho para a Celina e os pais !"
              />
            </label>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <GlowSubmitButton
                className="h-11 px-6 text-sm"
                bgColor="bg-primary"
                glowColor="rgba(246, 196, 83, 0.7)"
              >
                ✨ Confirmar
              </GlowSubmitButton>
            </div>
          </form>
        </motion.section>

        <SectionDivider variant="dots" />

        <motion.section
          id="presentes"
          className="scroll-mt-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h2 className="font-display text-3xl font-bold">Lista de presentes</h2>
          
          <div className="mt-6 rounded-3xl border-2 border-primary/40 bg-primaryLight/30 p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧷</span>
              <h3 className="font-display text-xl font-bold text-text">Fraldas – Presente obrigatório</h3>
            </div>
            <div className="mt-4 space-y-2 text-sm leading-6 text-text/80">
              <p>
                <strong className="text-text">Pedimos que cada convidado traga um pacote de fraldas</strong> das marcas <strong className="text-text">Pampers</strong> ou <strong className="text-text">Huggies</strong>.
              </p>
              <p className="flex items-center gap-2 rounded-xl bg-accent/20 px-3 py-2 text-text">
                <span>⚠️</span>
                <span><strong>Importante:</strong> NÃO traga tamanho RN (recém-nascido).</span>
              </p>
              <p className="flex items-center gap-2">
                <span>📱</span>
                <span>Acompanhe a <strong className="text-text">enquete no WhatsApp</strong> para verificar qual tamanho está sendo menos comprado e ajudar a equilibrar!</span>
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <h3 className="font-display text-xl font-bold">Lista de presentes (opcional)</h3>
            </div>
            <p className="mt-2 max-w-prose text-sm leading-6 text-text/70">
              Para quem quiser presentear além das fraldas, preparamos uma lista na Amazon.
              <br />
              <span className="italic">Os itens podem ser comprados em outros sites ou lojas físicas, incluindo produtos semelhantes de outras marcas.</span>
            </p>

            <div className="mt-4">
              <motion.a
                href="https://www.amazon.com.br/baby-reg/jssica-saggin-gustavo-nomelini-maro-2026-cascavel/E03SA4SL9PAI?ref_=cm_sw_r_cp_ud_dp_4NJJ9VWJY0HQE10DZZNX"
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-3xl border border-text/10 bg-background/90 p-6 shadow-[0_18px_50px_-34px_rgba(90,70,52,0.5)] transition hover:border-primary"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-xl font-bold">Lista da Amazon</div>
                    <div className="mt-1 text-sm text-text/80">Sugestões de presentes para a Celina</div>
                  </div>
                  <div className="rounded-full bg-primaryLight/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-text/70">
                    link
                  </div>
                </div>
                <div className="mt-4 text-sm font-semibold text-text/70 group-hover:text-text">
                  Abrir lista de presentes →
                </div>
              </motion.a>
            </div>
          </div>
        </motion.section>

        <SectionDivider variant="star" />

        <motion.section
          id="recados"
          className="scroll-mt-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h2 className="font-display text-3xl font-bold">Mural de recados</h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-text/80">
            Um espaço carinhoso para deixar mensagens para a Celina e a família.
          </p>

          <div className="mt-6">
            <GuestBook onToast={pushToast} />
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-text/10 bg-background/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-10 text-sm text-text/70 sm:flex-row sm:items-center sm:justify-between">
          <div>Feito com carinho para o Chá de Bebê da Celina.</div>
          <div className="text-xs">Com amor por Gus e Jess 💛</div>
        </div>
      </footer>
    </div>
  );
}
