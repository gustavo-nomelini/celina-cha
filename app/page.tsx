'use client';

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
    return new Date(2026, 0, 24, 16, 0);
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

  const [messageName, setMessageName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [wall, setWall] = useState<Array<{ name: string; text: string }>>([
    { name: 'Tia Ana', text: 'Celina, você já é muito amada!' },
    { name: 'Vovó', text: 'Que esse dia seja inesquecível para toda a família.' },
  ]);

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

  const onSubmitRsvp = (e: FormEvent) => {
    e.preventDefault();
    // Protótipo: neste momento só demonstra UI.
    // Depois dá para integrar com API route / banco.
    setRsvpName('');
    setRsvpGuests(1);
    setRsvpNote('');
    pushToast({
      title: 'Presença confirmada!',
      description: 'Obrigado por responder. (protótipo)',
      tone: 'success',
    });
  };

  const onAddMessage = (e: FormEvent) => {
    e.preventDefault();
    const name = messageName.trim();
    const text = messageText.trim();
    if (!name || !text) return;
    setWall((prev) => [{ name, text }, ...prev]);
    setMessageName('');
    setMessageText('');
    pushToast({ title: 'Recado publicado!', tone: 'info' });
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText('Rua Exemplo, 123');
      pushToast({
        title: 'Endereço copiado',
        description: 'Agora é só colar no seu app de mapas.',
        tone: 'success',
      });
    } catch {
      pushToast({
        title: 'Não foi possível copiar',
        description: 'Seu navegador bloqueou a ação.',
        tone: 'info',
      });
    }
  };

  return (
    <div className="min-h-dvh bg-background text-text">
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

      <header className="sticky top-0 z-30 border-b border-text/10 bg-background/75 backdrop-blur">
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

          <nav className="hidden items-center gap-3 text-sm font-semibold text-text/80 sm:flex">
            {[
              { id: 'detalhes', label: 'Detalhes' },
              { id: 'rsvp', label: 'Confirmação' },
              { id: 'presentes', label: 'Presentes' },
              { id: 'recados', label: 'Recados' },
            ].map((item) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => scrollToId(item.id)}
                className="rounded-full px-3 py-2 transition hover:bg-primaryLight hover:text-text"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          <motion.button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-text/15 bg-primaryLight/70 px-4 text-sm font-bold text-text sm:hidden"
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
              className="absolute right-3 top-3 w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-text/10 bg-background shadow-xl"
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
                  className="rounded-full border border-text/15 bg-primaryLight/70 px-3 py-1 text-sm font-bold"
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
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold text-text hover:bg-primaryLight"
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
            <div className="absolute left-6 top-8 h-28 w-28 rounded-full bg-accent/35 blur-2xl" />
            <div className="absolute right-6 top-16 h-32 w-32 rounded-full bg-primaryLight blur-2xl" />
            <div className="absolute bottom-0 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-success/35 blur-2xl" />
          </div>

          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div>
              <motion.p
                className="inline-flex items-center gap-2 rounded-full bg-primaryLight px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-text/80"
                whileHover={{ y: -1 }}
              >
                Convite interativo
                <span className="h-1 w-1 rounded-full bg-text/40" />
                Menina
              </motion.p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                Chá de Bebê da Celina
              </h1>
              <p className="mt-4 max-w-prose text-base leading-7 text-text/80">
                Você é nosso convidado especial para celebrar a chegada da nossa menina. Preparamos
                um convite leve, bonito e prático — com tudo em um só lugar.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={() => scrollToId('rsvp')}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-text shadow-sm transition hover:brightness-95"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirmar presença
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => scrollToId('presentes')}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-text/15 bg-primaryLight/70 px-6 text-sm font-bold text-text transition hover:bg-primaryLight/90"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Ver lista de presentes
                </motion.button>
              </div>
            </div>

            <motion.div
              className="rounded-3xl border border-text/10 bg-primaryLight/55 p-6 shadow-sm backdrop-blur"
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
                    className="rounded-2xl bg-primaryLight px-3 py-4 text-center"
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
                <div className="text-sm font-semibold">Data (placeholder)</div>
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

        <motion.section
          id="detalhes"
          className="mt-14 scroll-mt-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl font-bold">Detalhes do evento</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text/70">
              ajuste com os dados reais
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <motion.div
              className="rounded-3xl border border-text/10 bg-primaryLight/55 p-6"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-text/70">
                Quando
              </div>
              <div className="mt-2 font-display text-xl font-bold">24/01/2026</div>
              <div className="mt-1 text-sm text-text/80">16:00</div>
            </motion.div>
            <motion.div
              className="rounded-3xl border border-text/10 bg-primaryLight/55 p-6"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-text/70">Onde</div>
              <div className="mt-2 font-display text-xl font-bold">Espaço (placeholder)</div>
              <div className="mt-1 text-sm text-text/80">Rua Exemplo, 123</div>
              <motion.button
                type="button"
                onClick={copyAddress}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-full border border-text/15 bg-accent/50 px-4 text-xs font-bold text-text"
                whileTap={{ scale: 0.98 }}
              >
                Copiar endereço
              </motion.button>
            </motion.div>
            <motion.div
              className="rounded-3xl border border-text/10 bg-primaryLight/55 p-6"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-text/70">
                Dress code
              </div>
              <div className="mt-2 font-display text-xl font-bold">Confortável</div>
              <div className="mt-1 text-sm text-text/80">Cores claras / candy</div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="rsvp"
          className="mt-14 scroll-mt-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h2 className="font-display text-3xl font-bold">Confirmação de presença</h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-text/80">
            Preencha abaixo para confirmar. (No protótipo, os dados não são enviados para servidor.)
          </p>

          <form
            onSubmit={onSubmitRsvp}
            className="mt-6 rounded-3xl border border-text/10 bg-primaryLight/55 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Nome</span>
                <input
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  className="mt-2 h-11 w-full rounded-2xl border border-text/15 bg-background px-4 text-sm outline-none focus:border-primary"
                  placeholder="Seu nome"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Quantidade</span>
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
                className="mt-2 w-full resize-none rounded-2xl border border-text/15 bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                placeholder="Alergias, recadinho, etc."
              />
            </label>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-text/70">
                Dica: depois podemos integrar com WhatsApp, planilha ou banco.
              </p>
              <motion.button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full bg-success px-6 text-sm font-bold text-text transition hover:brightness-95"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Enviar RSVP
              </motion.button>
            </div>
          </form>
        </motion.section>

        <motion.section
          id="presentes"
          className="mt-14 scroll-mt-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h2 className="font-display text-3xl font-bold">Lista de presentes</h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-text/80">
            Sugestões com links (placeholders). Você pode trocar por links reais ou integrar com uma
            lista externa.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Fraldas (RN/P/M)', desc: 'Sugestão de kit com tamanhos variados.' },
              { title: 'Lenços umedecidos', desc: 'Pacotes com boa composição.' },
              { title: 'Body e mijão', desc: 'Algodão, cores claras.' },
              { title: 'Kit higiene', desc: 'Escova, pente, tesourinha.' },
            ].map((item) => (
              <motion.button
                key={item.title}
                type="button"
                onClick={() =>
                  pushToast({
                    title: 'Link em breve',
                    description: `Você clicou em: ${item.title}`,
                    tone: 'info',
                  })
                }
                className="group rounded-3xl border border-text/10 bg-primaryLight/55 p-6 transition hover:border-primary"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-xl font-bold">{item.title}</div>
                    <div className="mt-1 text-sm text-text/80">{item.desc}</div>
                  </div>
                  <div className="rounded-full bg-primaryLight px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-text/70">
                    link
                  </div>
                </div>
                <div className="mt-4 text-sm font-semibold text-text/70 group-hover:text-text">
                  Abrir sugestão
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="recados"
          className="mt-14 scroll-mt-24"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h2 className="font-display text-3xl font-bold">Mural de recados</h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-text/80">
            Um espaço carinhoso para deixar mensagens para a Celina e a família.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <form
              onSubmit={onAddMessage}
              className="rounded-3xl border border-text/10 bg-primaryLight/55 p-6"
            >
              <label className="block">
                <span className="text-sm font-semibold">Seu nome</span>
                <input
                  value={messageName}
                  onChange={(e) => setMessageName(e.target.value)}
                  className="mt-2 h-11 w-full rounded-2xl border border-text/15 bg-background px-4 text-sm outline-none focus:border-accent"
                  placeholder="Como você quer assinar"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-semibold">Mensagem</span>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-2xl border border-text/15 bg-background px-4 py-3 text-sm outline-none focus:border-accent"
                  placeholder="Escreva um recadinho..."
                />
              </label>
              <motion.button
                type="submit"
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-text transition hover:brightness-95"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Publicar
              </motion.button>
            </form>

            <div className="rounded-3xl border border-text/10 bg-primaryLight/55 p-6">
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-text/70">
                  Últimos recados
                </div>
                <div className="text-xs text-text/70">(protótipo local)</div>
              </div>
              <div className="mt-4 space-y-3">
                {wall.map((m, idx) => (
                  <motion.div
                    key={`${m.name}-${idx}`}
                    className="rounded-2xl bg-background px-4 py-3"
                    whileHover={{ y: -1 }}
                  >
                    <div className="text-sm font-bold">{m.name}</div>
                    <div className="mt-1 text-sm text-text/80">{m.text}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-text/10 bg-background">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-10 text-sm text-text/70 sm:flex-row sm:items-center sm:justify-between">
          <div>Feito com carinho para o Chá de Bebê da Celina.</div>
          <div className="text-xs">Next.js + TailwindCSS</div>
        </div>
      </footer>
    </div>
  );
}
