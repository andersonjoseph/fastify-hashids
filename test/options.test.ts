import { test } from 'tap';
import Fastify from 'fastify';
import { randomId } from './utils';
import plugin from '../src/';

test('passing a custom regex', async (t) => {
  t.plan(2);

  const fastify = Fastify();
  await fastify.register(plugin, {
    hashidsOptions: {
      idRegexp: /user/,
    },
  });

  const id = randomId();
  const encodedId = fastify.hashids.encode(id);

  fastify.get(`/`, () => ({
    user: id,
    id: id,
  }));

  const response = await fastify.inject({
    method: 'GET',
    url: `/`,
  });

  t.equal(response.statusCode, 200);
  t.same(JSON.parse(response.body), {
    user: encodedId,
    id: id,
  });

  await fastify.close();
});

test('passing a properyList with regexp enabled', async (t) => {
  t.plan(2);

  const fastify = Fastify();
  await fastify.register(plugin, {
    hashidsOptions: {
      propertyList: ['user'],
    },
  });

  const id = randomId();
  const encodedId = fastify.hashids.encode(id);

  fastify.get(`/`, () => ({
    user: id,
    id: id,
  }));

  const response = await fastify.inject({
    method: 'GET',
    url: `/`,
  });

  t.equal(response.statusCode, 200);
  t.same(JSON.parse(response.body), {
    user: encodedId,
    id: encodedId,
  });

  await fastify.close();
});

test('passing a properyList with regexp disabled', async (t) => {
  t.plan(2);

  const fastify = Fastify();
  await fastify.register(plugin, {
    hashidsOptions: {
      propertyList: ['user'],
      idRegexp: null,
    },
  });

  const id = randomId();
  const encodedId = fastify.hashids.encode(id);

  fastify.get(`/`, () => ({
    user: id,
    id: id,
  }));

  const response = await fastify.inject({
    method: 'GET',
    url: `/`,
  });

  t.equal(response.statusCode, 200);
  t.same(JSON.parse(response.body), {
    user: encodedId,
    id: id,
  });

  await fastify.close();
});
