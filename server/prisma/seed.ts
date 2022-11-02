// o seed é básicamente um arquivo que pré-popula o banco de dados com alguns
// dados fictícios para trabalhar em ambiente de desenvolvimento
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      avatarUrl: 'https://github.com/Rodrigo001-dev.png',
    }
  });

  const pool = await prisma.pool.create({
    data: {
      title: 'Example Pool',
      code: 'BOL123',
      ownerId: user.id,

      // o prisma permite eu inserir um participante ao mesmo tempo que eu crio
      // o pool(bolão)
      participants: {
        create: {
          userId: user.id
        }
      },
    }
  });

  // const participant = await prisma.participant.create({
  //   data: {
  //     poolId: pool.id,
  //     userId: user.id
  //   }
  // });

  await prisma.game.create({
    data: {
      date: '2022-11-02T12:00:00.108Z',
      firstTeamCountryCode: 'DE',
      secondTeamCountryCode: 'BR',
    }
  });

  await prisma.game.create({
    data: {
      date: '2022-11-03T12:00:00.108Z',
      firstTeamCountryCode: 'BR',
      secondTeamCountryCode: 'AR',

      guesses: {
        create: {
          firstTeamPoints: 2,
          secondTeamPoints: 1,

          participant: {
            // o connect vai conectar a um participante existente
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id
              }
            }
          }
        }
      }
    }
  });
};

main();