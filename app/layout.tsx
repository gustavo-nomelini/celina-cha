import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chá da Celina',
  description: 'Convite interativo para o Chá de Bebê da Celina.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="min-h-dvh bg-background text-text antialiased font-sans">{children}</body>
    </html>
  );
}
