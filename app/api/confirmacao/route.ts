import { prisma } from '@/lib/prisma';
import { confirmacaoSchema } from '@/lib/validators/confirmacao';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });

    const totalGuests = guests.length;
    const totalPeople = guests.reduce((acc: number, g) => acc + g.quantity, 0);

    return NextResponse.json({
      ok: true,
      data: {
        guests,
        stats: { totalGuests, totalPeople },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar confirmações:', error);
    return NextResponse.json(
      { ok: false, error: { message: 'Erro ao buscar confirmações' } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = confirmacaoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { message: parsed.error.issues[0]?.message ?? 'Dados inválidos' } },
        { status: 400 }
      );
    }

    const { name, quantity, note } = parsed.data;

    const existingGuest = await prisma.guest.findUnique({
      where: { name },
    });

    if (existingGuest) {
      return NextResponse.json(
        { ok: false, error: { message: 'Este nome já confirmou presença' } },
        { status: 409 }
      );
    }

    const guest = await prisma.guest.create({
      data: { name, quantity, note },
    });

    return NextResponse.json({ ok: true, data: guest }, { status: 201 });
  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    return NextResponse.json(
      { ok: false, error: { message: 'Erro ao confirmar presença' } },
      { status: 500 }
    );
  }
}
