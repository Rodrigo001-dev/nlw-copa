import { FastifyInstance } from "fastify";
import { z } from 'zod';
import ShortUniqueId from 'short-unique-id';

import { prisma } from "../lib/prisma";

export async function pollRoutes(fastify: FastifyInstance) {
  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count();

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
};