import { prisma } from '@/lib/prisma';
import { recadoSchema } from '@/lib/validators/recado';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const recados = await prisma.guest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ ok: true, data: recados });
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
    const parsed = recadoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: parsed.error.issues[0]?.message ?? 'Dados inválidos' } },
        { status: 400 }
      );
    }

    const { name, message } = parsed.data;

    const recado = await prisma.guest.create({
      data: {
        name,
        message: message || '',
      },
    });

    return NextResponse.json({ ok: true, data: recado }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar recado:', error);
    return NextResponse.json(
      { ok: false, error: { message: 'Erro ao criar recado' } },
      { status: 500 }
    );
  }
}
