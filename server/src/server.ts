import Fastify from 'fastify';

// a função start vai ser a primeira função que vai ser executada pelo código
async function start() {
  const fastify = Fastify({
    // com o logger como true o fastify vai ficar soltando logs de tudo que está
    // acontecendo na aplicação
    logger: true,
  });

  fastify.get('/pools/count', () => {
    return { count: 0 };
  });

  await fastify.listen({ port: 3333 });
};

start();