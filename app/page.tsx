'use client';

import { useEffect, useMemo, useState } from 'react';

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

export default function Home() {
  const eventDate = useMemo(() => {
    // Ajuste depois com a data real do evento.
    // Formato: ano, mês-1, dia, hora, minuto
    return new Date(2026, 0, 24, 16, 0);
  }, []);

  const [countdown, setCountdown] = useState<Countdown>(() =>
    diffToCountdown(eventDate.getTime(), Date.now())
  );

  const [rsvpName, setRsvpName] = useState('');
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpNote, setRsvpNote] = useState('');

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

  const onSubmitRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    // Protótipo: neste momento só demonstra UI.
    // Depois dá para integrar com API route / banco.
    setRsvpName('');
    setRsvpGuests(1);
    setRsvpNote('');
    window.alert('RSVP enviado! (protótipo)');
  };

  const onAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const name = messageName.trim();
    const text = messageText.trim();
    if (!name || !text) return;
    setWall((prev) => [{ name, text }, ...prev]);
    setMessageName('');
    setMessageText('');
  };

  return (
    <div className="min-h-dvh bg-background text-text">
      <header className="sticky top-0 z-20 border-b border-text/10 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold tracking-tight">Celina</span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text/70">
              chá de bebê
            </span>
          </div>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-text/80 sm:flex">
            <a className="hover:text-text" href="#detalhes">
              Detalhes
            </a>
            <a className="hover:text-text" href="#rsvp">
              Confirmação
            </a>
            <a className="hover:text-text" href="#presentes">
              Presentes
            </a>
            <a className="hover:text-text" href="#recados">
              Recados
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20">
        <section className="relative pt-10 sm:pt-14">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-6 top-8 h-28 w-28 rounded-full bg-accent/35 blur-2xl" />
            <div className="absolute right-6 top-16 h-32 w-32 rounded-full bg-primaryLight blur-2xl" />
            <div className="absolute bottom-0 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full bg-success/35 blur-2xl" />
          </div>

          <div className="grid items-center gap-10 sm:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primaryLight px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-text/80">
                Convite interativo
                <span className="h-1 w-1 rounded-full bg-text/40" />
                Menina
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                Chá de Bebê da Celina
              </h1>
              <p className="mt-4 max-w-prose text-base leading-7 text-text/80">
                Você é nosso convidado especial para celebrar a chegada da nossa menina. Preparamos
                um convite leve, bonito e prático — com tudo em um só lugar.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#rsvp"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-text shadow-sm transition hover:brightness-95"
                >
                  Confirmar presença
                </a>
                <a
                  href="#presentes"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-text/15 bg-white/40 px-6 text-sm font-bold text-text transition hover:bg-white/60"
                >
                  Ver lista de presentes
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-text/10 bg-white/50 p-6 shadow-sm backdrop-blur">
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
                  <div
                    key={item.label}
                    className="rounded-2xl bg-primaryLight px-3 py-4 text-center"
                  >
                    <div className="font-display text-3xl font-bold leading-none">{item.value}</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-text/70">
                      {item.label}
                    </div>
                  </div>
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
            </div>
          </div>
        </section>

        <section id="detalhes" className="mt-14 scroll-mt-24">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl font-bold">Detalhes do evento</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text/70">
              ajuste com os dados reais
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-text/10 bg-white/50 p-6">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-text/70">
                Quando
              </div>
              <div className="mt-2 font-display text-xl font-bold">24/01/2026</div>
              <div className="mt-1 text-sm text-text/80">16:00</div>
            </div>
            <div className="rounded-3xl border border-text/10 bg-white/50 p-6">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-text/70">Onde</div>
              <div className="mt-2 font-display text-xl font-bold">Espaço (placeholder)</div>
              <div className="mt-1 text-sm text-text/80">Rua Exemplo, 123</div>
            </div>
            <div className="rounded-3xl border border-text/10 bg-white/50 p-6">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-text/70">
                Dress code
              </div>
              <div className="mt-2 font-display text-xl font-bold">Confortável</div>
              <div className="mt-1 text-sm text-text/80">Cores claras / candy</div>
            </div>
          </div>
        </section>

        <section id="rsvp" className="mt-14 scroll-mt-24">
          <h2 className="font-display text-3xl font-bold">Confirmação de presença</h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-text/80">
            Preencha abaixo para confirmar. (No protótipo, os dados não são enviados para servidor.)
          </p>

          <form
            onSubmit={onSubmitRsvp}
            className="mt-6 rounded-3xl border border-text/10 bg-white/50 p-6"
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
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full bg-success px-6 text-sm font-bold text-text transition hover:brightness-95"
              >
                Enviar RSVP
              </button>
            </div>
          </form>
        </section>

        <section id="presentes" className="mt-14 scroll-mt-24">
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
              <a
                key={item.title}
                href="#"
                className="group rounded-3xl border border-text/10 bg-white/50 p-6 transition hover:border-primary"
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
              </a>
            ))}
          </div>
        </section>

        <section id="recados" className="mt-14 scroll-mt-24">
          <h2 className="font-display text-3xl font-bold">Mural de recados</h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-text/80">
            Um espaço carinhoso para deixar mensagens para a Celina e a família.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <form
              onSubmit={onAddMessage}
              className="rounded-3xl border border-text/10 bg-white/50 p-6"
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
              <button
                type="submit"
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-text transition hover:brightness-95"
              >
                Publicar
              </button>
            </form>

            <div className="rounded-3xl border border-text/10 bg-white/50 p-6">
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-bold uppercase tracking-[0.18em] text-text/70">
                  Últimos recados
                </div>
                <div className="text-xs text-text/70">(protótipo local)</div>
              </div>
              <div className="mt-4 space-y-3">
                {wall.map((m, idx) => (
                  <div key={`${m.name}-${idx}`} className="rounded-2xl bg-background px-4 py-3">
                    <div className="text-sm font-bold">{m.name}</div>
                    <div className="mt-1 text-sm text-text/80">{m.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
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
