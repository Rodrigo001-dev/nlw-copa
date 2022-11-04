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

    let ownerId = null;

    try {
      // se esse codigo executar, quer dizer que eu tenho um usúario autenticado
      await request.jwtVerify();

      // se eu tenho o usuário autenticado, eu crio o bolão onde o ownerId vem
      // de dentro de request.user.sub o sub é o id do usuário que está guardado
      // dentro do token
      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub
        }
      });
    } catch {
      // se eu não tenho usuário autenticado, eu vou criar o bolão sem o ownerId
      await prisma.pool.create({
        data: {
          title,
          code
        }
      });
    }

    return response.status(201).send({ code });
  });
};