import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // com o esse log o prisma vai dar logs de todas as queries que são executadas
  // no banco de dados
  log: ['query'],
});

// a função start vai ser a primeira função que vai ser executada pelo código
async function start() {
  const fastify = Fastify({
    // com o logger como true o fastify vai ficar soltando logs de tudo que está
    // acontecendo na aplicação
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count();

    return { count };
  });

  await fastify.listen({ port: 3333, /*host: '0.0.0.0'*/ });
};

start();