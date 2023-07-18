import { test } from 'tap';
import { idKeys, idsKeys, randomId, randomIds } from './utils';
import Fastify from 'fastify';
import plugin from '../src/';

test('non-ids array should not be encoded', async (t) => {
  t.plan(2);

  const id = randomId();

  const fastify = Fastify();
  await fastify.register(plugin);

  fastify.get(`/`, () => [id]);

  const response = await fastify.inject({
    method: 'GET',
    url: `/`,
  });

  t.equal(response.statusCode, 200);
  t.equal(JSON.parse(response.body)[0], id);

  await fastify.close();
});

test('encode Ids in matrices of objects', async (t) => {
  t.plan(idKeys.length * 2);

  for (const key of idKeys) {
    const id = randomId();

    const fastify = Fastify();
    await fastify.register(plugin);

    const encodedId = fastify.hashids.encode(id);
    fastify.get(`/`, () => ({
      users: [[{ [key]: id }]],
    }));

    const response = await fastify.inject({
      method: 'GET',
      url: `/`,
    });

    t.equal(response.statusCode, 200);
    t.equal(JSON.parse(response.body).users[0][0][key], encodedId);

    await fastify.close();
  }
});

test('encode Ids in array of objects', async (t) => {
  t.plan(idKeys.length * 2);

  for (const key of idKeys) {
    const id = randomId();

    const fastify = Fastify();
    await fastify.register(plugin);

    const encodedId = fastify.hashids.encode(id);
    fastify.get(`/`, () => ({
      users: [
        {
          [key]: id,
        },
      ],
    }));

    const response = await fastify.inject({
      method: 'GET',
      url: `/`,
    });

    t.equal(response.statusCode, 200);
    t.equal(JSON.parse(response.body).users[0][key], encodedId);

    await fastify.close();
  }
});

test('encode nested Ids', async (t) => {
  t.plan(idKeys.length * 2);

  for (const key of idKeys) {
    const id = randomId();

    const fastify = Fastify();
    await fastify.register(plugin);

    const encodedId = fastify.hashids.encode(id);
    fastify.get(`/`, () => ({
      user: {
        topFollower: {
          [key]: id,
        },
      },
    }));

    const response = await fastify.inject({
      method: 'GET',
      url: `/`,
    });

    t.equal(response.statusCode, 200);
    t.equal(JSON.parse(response.body).user.topFollower[key], encodedId);

    await fastify.close();
  }
});

test('encode arrray of objects', async (t) => {
  t.plan(idKeys.length * 2);

  for (const key of idKeys) {
    const fastify = Fastify();
    await fastify.register(plugin);

    const id = randomId();
    const encodedId = fastify.hashids.encode(id);

    fastify.get('/', () => [{ [key]: id, original: id }]);

    const response = await fastify.inject({
      method: 'GET',
      url: `/`,
    });

    t.equal(response.statusCode, 200);
    t.same(JSON.parse(response.body), [
      {
        [key]: encodedId,
        original: id,
      },
    ]);

    fastify.close();
  }
});

test('encode single object', async (t) => {
  t.plan(idKeys.length * 2);

  for (const key of idKeys) {
    const fastify = Fastify();
    await fastify.register(plugin);

    const id = randomId();
    const encodedId = fastify.hashids.encode(id);

    fastify.get('/', () => ({ [key]: id, original: id }));

    const response = await fastify.inject({
      method: 'GET',
      url: `/`,
    });

    t.equal(response.statusCode, 200);
    t.same(JSON.parse(response.body), {
      [key]: encodedId,
      original: id,
    });

    fastify.close();
  }
});

test('disableHashids===true does not encode the ids', async (t) => {
  t.plan(idKeys.length * 2);

  for (const key of idKeys) {
    const fastify = Fastify();
    await fastify.register(plugin);

    const id = randomId();

    fastify.get('/', { config: { disableHashids: true } }, () => ({
      [key]: id,
      original: id,
    }));

    const response = await fastify.inject({
      method: 'GET',
      url: `/`,
    });

    t.equal(response.statusCode, 200);
    t.same(JSON.parse(response.body), {
      [key]: id,
      original: id,
    });

    fastify.close();
  }
});

test('encode array of ids', async (t) => {
  t.plan(idsKeys.length * 2);

  for (const key of idsKeys) {
    const fastify = Fastify();
    await fastify.register(plugin);

    const ids = randomIds();
    const encodedIds = ids.map((id) => fastify.hashids.encode(id));

    fastify.get('/', () => ({ [key]: ids, original: ids }));

    const response = await fastify.inject({
      method: 'GET',
      url: `/`,
    });

    t.equal(response.statusCode, 200);
    t.same(JSON.parse(response.body), {
      [key]: encodedIds,
      original: ids,
    });

    fastify.close();
  }
});
