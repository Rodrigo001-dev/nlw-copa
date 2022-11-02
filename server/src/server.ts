import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import ShortUniqueId from 'short-unique-id';

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

  fastify.get('/users/count', async () => {
    const count = await prisma.user.count();

    return { count };
  });

  fastify.get('/guesses/count', async () => {
    const count = await prisma.guess.count();

    return { count };
  });

  fastify.post('/pools', async (request, response) => {
    const createPoolBody = z.object({
      title: z.string(),
    });
    
    const { title } = createPoolBody.parse(request.body);

    // vai criar um codigo de 6 caracteres
    const generate = new ShortUniqueId({ length: 6 });
    const code = String(generate()).toUpperCase();

    await prisma.pool.create({
      data: {
        title,
        code
      }
    });

    return response.status(201).send({ code });
  });

  await fastify.listen({ port: 3333, /*host: '0.0.0.0'*/ });
};

start();