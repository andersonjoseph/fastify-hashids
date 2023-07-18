import createError from '@fastify/error';

export const InvalidIdError = createError(
  'FST_HASHIDS_INVALID_ID',
  'The provided ID is invalid',
  400,
);
