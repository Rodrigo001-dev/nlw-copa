import { FastifyInstance } from "fastify";
import { z } from 'zod';
import ShortUniqueId from 'short-unique-id';

import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

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
          ownerId: request.user.sub,

          participants: {
            create: {
              userId: request.user.sub
            }
          }
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

  fastify.post('/pools/join', {
    onRequest: [authenticate]
  }, async (request, response) => {
    const joinPoolBody = z.object({
      code: z.string(),
    });

    const { code } = joinPoolBody.parse(request.body);

    const pool = await prisma.pool.findUnique({
      where: {
        code,
      },
      // quando eu faço um find no prisma, eu busco uma informação, eu posso
      // também ao mesmo tempo automáticamente trazer dados de relacionamentos
      // entre tabelas
      // o include vai fazer um join no SQL, ele trás informações de um
      // relacionamento
      include: {
        // quero que traga os dados dos participantes desse bolão
        participants: {
          // vou buscar a lista de participantes onde
          where: {
            // o id do participante seja o usuário logado
            userId: request.user.sub
          }
        }
      }
    });

    // se não encontrar o bolão, quer dizer que o bolão não existe
    if (!pool) {
      return response.status(400).send({
        message: 'Poll not found.'
      });
    }
    
    // se retornar algum dado do participante, quer dizer que o usuário já
    // participa desse bolão
    if (pool.participants.length > 0) {
      return response.status(400).send({
        message: 'You already joined this poll.'
      });
    };

    // quando o usuário estiver tentando participar de um bolão e esse bolão ainda
    // não tiver um dono, eu vou colocar o primeiro usuário que entra no bolão
    // como dono
    if (!pool.ownerId) {
      await prisma.pool.update({
        where: {
          id: pool.id,
        },
        data: {
          ownerId: request.user.sub
        }
      });
    };

    await prisma.participant.create({
      data: {
        poolId: pool.id,
        userId: request.user.sub,
      }
    });

    return response.status(201).send();
  });

  fastify.get('/pools', {
    onRequest: [authenticate]
  }, async (request) => {
    // eu quero encontrar varios bolões
    const pools = await prisma.pool.findMany({
      // onde a lista de participantes
      where: {
        participants: {
          // inclui pelo menos(some)
          some: {
            userId: request.user.sub
          }
        }
      },
      include: {
        // vai fazer uma contagem
        _count: {
          // no relacionamento
          select: {
            // de participantes
            participants: true,
          }
        },
        participants: {
          select: {
            // desse relacionamento eu vou selecionar apenas o campo id
            id: true,

            // aqui eu vou pegar tanto o id do participante quanto o avatarUrl
            // do usuário que está participando(no caso o participante)
            user: {
              select: {
                avatarUrl: true,
              }
            }
          },
          // take é quantos participantes eu quero trazer, ou seja, ele vai
          // trazer para mim o id de 4 participantes
          take: 4,
        },
        owner: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return { pools };
  });

  fastify.get('/pools/:id', {
    onRequest: [authenticate],
  }, async (request) => {
    const getPoolParams = z.object({
      id: z.string(),
    });

    const { id } = getPoolParams.parse(request.params);

    const pool = await prisma.pool.findUnique({
      // onde a lista de participantes
      where: {
        id,
      },
      include: {
        // vai fazer uma contagem
        _count: {
          // no relacionamento
          select: {
            // de participantes
            participants: true,
          }
        },
        participants: {
          select: {
            // desse relacionamento eu vou selecionar apenas o campo id
            id: true,

            // aqui eu vou pegar tanto o id do participante quanto o avatarUrl
            // do usuário que está participando(no caso o participante)
            user: {
              select: {
                avatarUrl: true,
              }
            }
          },
          // take é quantos participantes eu quero trazer, ou seja, ele vai
          // trazer para mim o id de 4 participantes
          take: 4,
        },
        owner: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return { pool };
  });
};