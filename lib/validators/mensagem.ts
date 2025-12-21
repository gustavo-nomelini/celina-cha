import { z } from 'zod';

export const mensagemSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  content: z.string().min(1, 'Mensagem é obrigatória').max(500, 'Mensagem muito longa'),
});

export type MensagemInput = z.infer<typeof mensagemSchema>;
