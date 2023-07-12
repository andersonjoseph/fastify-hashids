import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
  preSerializationHookHandler,
  preValidationHookHandler,
} from 'fastify';
import Hashids from 'hashids';
import utils from './utils';

export type HashidsPluginOptions = {
  hashidsOptions?: {
    salt?: string;
    minLength?: number;
    alphabet?: string;
    seps?: string;
    idRegex?: RegExp;
  };
};

function plugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions & HashidsPluginOptions,
  done: (err?: Error) => void,
): void {
  const hashids = new Hashids(
    options.hashidsOptions?.salt,
    options.hashidsOptions?.minLength,
    options.hashidsOptions?.alphabet,
    options.hashidsOptions?.seps,
  );

  const idRegexp =
    options.hashidsOptions?.idRegex || /^(id|ID|Id|\w+(id|ID|Id))$/;

  const encoder = new utils.Encoder({ idRegexp, hashids });
  const decoder = new utils.Decoder({ idRegexp, hashids });

  function encodePayloadHook(
    _: FastifyRequest,
    __: FastifyReply,
    payload: unknown,
    done: (err?: Error | null, payload?: unknown) => void,
  ): void {
    const encodedPayload = encoder.encodePayload(payload);

    done(null, encodedPayload);
  }

  function decodeParamsHook(
    request: FastifyRequest,
    _: FastifyReply,
    done: (err?: Error) => void,
  ): void {
    if (!utils.isObject(request.params)) {
      return done();
    }
    const decodedParams = decoder.decodeObject(request.params);

    request.params = decodedParams;

    done();
  }

  function decodeBodyHook(
    request: FastifyRequest,
    _: FastifyReply,
    done: (err?: Error) => void,
  ): void {
    if (!utils.isObject(request.body)) {
      return done();
    }
    const decodedBody = decoder.decodeObject(request.body);

    request.body = decodedBody;
    done();
  }

  fastify.addHook('onRoute', (routeOptions) => {
    const existingPreValidationHooks =
      (routeOptions.preValidation as preValidationHookHandler[]) || [];

    routeOptions.preValidation = [
      decodeParamsHook,
      decodeBodyHook,
      ...existingPreValidationHooks,
    ];

    const existingPreSerializationHooks =
      (routeOptions.preSerialization as preSerializationHookHandler<unknown>[]) ||
      [];

    routeOptions.preSerialization = [
      encodePayloadHook,
      ...existingPreSerializationHooks,
    ];
  });

  done();
}

export default plugin;
