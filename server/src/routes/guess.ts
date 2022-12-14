import { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get('/guesses/count', async () => {
    const count = await prisma.guess.count();

    return { count };
  });

  fastify.post('/pools/:poolId/games/:gameId/guesses', {
   onRequest: [authenticate]
  }, async (request, response) => {
    const createGuessParams = z.object({
      poolId: z.string(),
      gameId: z.string(),
    });

    const createGuessBody = z.object({
      firstTeamPoints: z.number(),
      secondTeamPoints: z.number(),
    });

    const { poolId, gameId } = createGuessParams.parse(request.params);
    const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(request.body);

    const participant = await prisma.participant.findUnique({
      where: {
        userId_poolId: {
          poolId,
          userId: request.user.sub
        }
      }
    });

    // se não existir o participant, se não for retornado nada, quer dizer que o
    // usuário não faz parte desse bolão, porque não existe um participante com
    // essas informações
    if (!participant) {
      return response.status(400).send({
        message: "You're not allowed to create a guess inside this poll."
      });
    };

    // vou procurar se já existe um palpite enviado por esse usuário, porque se
    // esse usuário já fez um palpite eu não posso permitir ele fazer um novo
    // palpite
    const guess = await prisma.guess.findUnique({
      where: {
        participantId_gameId: {
          participantId: participant.id,
          gameId
        }
      }
    });

    // se ele encontrou um palpite(guess), quer dizer que o usuário já fez um palpite
    // para esse game
    if (guess) {
      return response.status(400).send({
        message: 'You already sent a guess to this game on this poll.',
      });
    };

    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      }
    });

    if (!game) {
      return response.status(400).send({
        message: "Game not found."
      });
    };

    // se a data do game for anterior a data atual
    if (game.date < new Date()) {
      // eu vou retornar um erro
      return response.status(400).send({
        message: "You cannot send guesses after the game date."
      });
    };

    await prisma.guess.create({
      data: {
        gameId,
        participantId: participant.id,
        firstTeamPoints,
        secondTeamPoints,
      }
    });

    return response.status(201).send();

  });
};