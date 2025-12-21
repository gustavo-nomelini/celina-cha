import { z } from 'zod';

export const recadoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  message: z.string().max(500, 'Mensagem muito longa').optional().default(''),
});

export type RecadoInput = z.infer<typeof recadoSchema>;
