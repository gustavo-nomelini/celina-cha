import { prisma } from '@/lib/prisma';
import { mensagemSchema } from '@/lib/validators/mensagem';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ ok: true, data: messages });
  } catch (error) {
    console.error('Erro ao buscar recados:', error);
    return NextResponse.json(
      { ok: false, error: { message: 'Erro ao buscar recados' } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = mensagemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: parsed.error.issues[0]?.message ?? 'Dados inválidos' } },
        { status: 400 }
      );
    }

    const { name, content } = parsed.data;

    const message = await prisma.message.create({
      data: { name, content },
    });

    return NextResponse.json({ ok: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar recado:', error);
    return NextResponse.json(
      { ok: false, error: { message: 'Erro ao criar recado' } },
      { status: 500 }
    );
  }
}
