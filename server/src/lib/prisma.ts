import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  // com o esse log o prisma vai dar logs de todas as queries que são executadas
  // no banco de dados
  log: ['query'],
});