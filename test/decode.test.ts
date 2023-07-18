import { test } from 'tap';
import { idKeys, idsKeys, randomId, randomIds } from './utils';
import Fastify, { FastifyRequest } from 'fastify';
import plugin from '../src/';

test('decode properties in request', (t) => {
  t.plan(3);

  type TestRequestKeys = 'Params' | 'Body' | 'Querystring';
  type TestRequest = FastifyRequest<{
    [K in TestRequestKeys]: Record<string, number>;
  }>;

  function createTestRequestHandler(
    idKey: string,
    property: 'body' | 'params' | 'query',
  ) {
    return (request: TestRequest) => ({ result: request[property][idKey] }); // eslint-disable-line
  }

  t.test('decode params', async (t) => {
    t.plan(idKeys.length * 2);

    for (const key of idKeys) {
      const id = randomId();

      const fastify = Fastify();
      await fastify.register(plugin);

      const encodedId = fastify.hashids.encode(id);
      fastify.get(`/:${key}`, createTestRequestHandler(key, 'params'));

      const response = await fastify.inject({
        method: 'GET',
        url: `/${encodedId}`,
      });

      t.equal(response.statusCode, 200);
      t.equal(JSON.parse(response.body).result, id);

      await fastify.close();
    }
  });

  t.test('decode querystring', async (t) => {
    t.plan(idKeys.length * 2);

    for (const key of idKeys) {
      const id = randomId();

      const fastify = Fastify();
      await fastify.register(plugin);

      const encodedId = fastify.hashids.encode(id);
      fastify.get(`/`, createTestRequestHandler(key, 'query'));

      const response = await fastify.inject({
        method: 'GET',
        url: `/`,
        query: {
          [key]: `${encodedId}`,
        },
      });

      t.equal(response.statusCode, 200);
      t.equal(JSON.parse(response.body).result, id);

      await fastify.close();
    }
  });

  t.test('decode body', async (t) => {
    t.plan(idKeys.length * 2);

    for (const key of idKeys) {
      const id = randomId();

      const fastify = Fastify();
      await fastify.register(plugin);

      const encodedId = fastify.hashids.encode(id);
      fastify.post(`/`, createTestRequestHandler(key, 'body'));

      const response = await fastify.inject({
        method: 'POST',
        url: `/`,
        body: {
          [key]: `${encodedId}`,
        },
      });

      t.equal(response.statusCode, 200);
      t.equal(JSON.parse(response.body).result, id);

      await fastify.close();
    }
  });
});

test('non ids properties are not decoded', async (t) => {
  t.plan(2);

  const fastify = Fastify();
  await fastify.register(plugin);

  fastify.post(`/`, (request: FastifyRequest<{ Body: { name: string } }>) => {
    const result = request.body.name;

    return { result };
  });

  const response = await fastify.inject({
    method: 'POST',
    url: `/`,
    body: {
      name: 'ander',
    },
  });

  t.equal(response.statusCode, 200);
  t.equal(JSON.parse(response.body).result, 'ander');

  await fastify.close();
});

test('decode nested Ids', async (t) => {
  t.plan(idKeys.length * 2);

  for (const key of idKeys) {
    const id = randomId();

    const fastify = Fastify();
    await fastify.register(plugin);

    const encodedId = fastify.hashids.encode(id);
    fastify.post(
      `/`,
      (
        request: FastifyRequest<{
          Body: { user: { topFollower: Record<string, unknown> } };
        }>,
      ) => ({
        result: request.body.user.topFollower[key],
      }),
    );

    const response = await fastify.inject({
      method: 'POST',
      url: `/`,
      body: {
        user: {
          topFollower: {
            [key]: encodedId,
          },
        },
      },
    });

    t.equal(response.statusCode, 200);
    t.equal(JSON.parse(response.body).result, id);

    await fastify.close();
  }
});

test('values that are not ids are not decoded', async (t) => {
  t.plan(2);

  const fastify = Fastify();
  await fastify.register(plugin);

  fastify.get(`/`, () => 200);

  const response = await fastify.inject({
    method: 'GET',
    url: `/`,
  });

  t.equal(response.statusCode, 200);
  t.equal(JSON.parse(response.body), 200);

  await fastify.close();
});

test('values that are not ids in an array are not decoded', async (t) => {
  t.plan(2);

  const id = randomId();

  const fastify = Fastify();
  await fastify.register(plugin);

  const encodedId = fastify.hashids.encode(id);
  fastify.post(
    `/`,
    (request: FastifyRequest<{ Body: { entities: string[] } }>) => ({
      result: request.body.entities[0],
    }),
  );

  const response = await fastify.inject({
    method: 'POST',
    url: `/`,
    body: {
      entities: [encodedId],
    },
  });

  t.equal(response.statusCode, 200);
  t.equal(JSON.parse(response.body).result, encodedId);

  await fastify.close();
});

test('decode ids in matrices of objects', async (t) => {
  t.plan(idKeys.length * 2);

  for (const key of idKeys) {
    const id = randomId();

    const fastify = Fastify({ logger: { level: 'error' } });
    await fastify.register(plugin);

    const encodedId = fastify.hashids.encode(id);
    fastify.post(
      `/`,
      (
        request: FastifyRequest<{
          Body: { entities: Record<string, number>[][] };
        }>,
      ) => ({
        result: request.body.entities[0][0][key],
      }),
    );

    const response = await fastify.inject({
      method: 'POST',
      url: `/`,
      body: {
        entities: [
          [
            {
              [key]: `${encodedId}`,
            },
          ],
        ],
      },
    });

    t.equal(response.statusCode, 200);
    t.equal(JSON.parse(response.body).result, id);

    await fastify.close();
  }
});

test('decode ids in array of objects', async (t) => {
  t.plan(idKeys.length * 2);

  for (const key of idKeys) {
    const id = randomId();

    const fastify = Fastify({ logger: { level: 'error' } });
    await fastify.register(plugin);

    const encodedId = fastify.hashids.encode(id);
    fastify.post(
      `/`,
      (
        request: FastifyRequest<{
          Body: { entities: Record<string, number>[] };
        }>,
      ) => ({
        result: request.body.entities[0][key],
      }),
    );

    const response = await fastify.inject({
      method: 'POST',
      url: `/`,
      body: {
        entities: [
          {
            [key]: `${encodedId}`,
          },
        ],
      },
    });

    t.equal(response.statusCode, 200);
    t.equal(JSON.parse(response.body).result, id);

    await fastify.close();
  }
});

test('decode array of ids', async (t) => {
  t.plan(idsKeys.length * 2);

  for (const key of idsKeys) {
    const fastify = Fastify();
    await fastify.register(plugin);

    const ids = randomIds();
    const encodedIds = ids.map((id) => fastify.hashids.encode(id));

    fastify.post(
      `/`,
      (
        request: FastifyRequest<{
          Body: { [K in typeof key]: Record<typeof key, number>[] };
        }>,
      ) => ({
        result: request.body[key],
      }),
    );

    const response = await fastify.inject({
      method: 'POST',
      url: `/`,
      body: {
        [key]: encodedIds,
      },
    });

    t.equal(response.statusCode, 200);
    t.same(JSON.parse(response.body).result, ids);

    fastify.close();
  }
});
