import { z } from 'zod';

export const confirmacaoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  quantity: z.number().int().min(1, 'Mínimo 1 pessoa').max(10, 'Máximo 10 pessoas').default(1),
  note: z.string().max(500, 'Observação muito longa').optional(),
});

export type ConfirmacaoInput = z.infer<typeof confirmacaoSchema>;
