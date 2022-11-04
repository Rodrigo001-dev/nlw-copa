// o d.ts no arquivo quer dizer que esse arquivo só vai conter definições de tipos
// do typescript, ele não vai ter código, é um arquivo apenas para o typescript
// ler para ele obter informações sobre tipagem de alguma coisa

import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string;
      name: string;
      avatarUrl: string;
    }
  }
};

