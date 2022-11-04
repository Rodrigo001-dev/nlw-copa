import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

import { authenticate } from "../plugins/authenticate";

export async function gameRoutes(fastify: FastifyInstance) {
  fastify.get('/pools/:id/games', {
    onRequest: [authenticate]
  }, async (request) => {
    const getPoolParams = z.object({
      id: z.string(),
    });

    const { id } = getPoolParams.parse(request.params);

    const games = await prisma.game.findMany({
      // eu vou ordenar os games por data que o jogo vai acontecer de forma
      // decrescente, ou seja, conforme os games vão sendo adicionados, eles
      // aparecer no topo da lista ao invés de aparecer em baixo, eu sempre vou
      // mostrar os games mais recentemente adicionados sempre acima(os games que
      // tem data mais distantes para acontecer)
      orderBy: {
        date: 'desc',
      },
      include: {
        // isso aqui vai me retornar se o participante fez um palpite(guess) para
        // esse game
        guesses: {
          where: {
            participant: {
              userId: request.user.sub,
              poolId: id,
            }
          }
        }
      }
    });

    return {
      // vou fazer uma map
      games: games.map(game => {
        // e para cada game eu vou retornar
        return {
          // todas as informações que já existem dentro do game
          ...game,
          // se dentro do array de palpites(game.guesses) eu tiver
          // alguma informação(length > 0) eu retorno apenas a primeira
          // informação(game.guesses[0]) porque sempre só vai existir no máximo
          // uma informação porque o usuário só pode fazer um palpite(guess)
          // dentro do game
          guess: game.guesses.length > 0 ? game.guesses[0] : null,
          // colocando o guesses como undefined ele vai sumir do array
          guesses: undefined,
        }
      })
    };
  });
};