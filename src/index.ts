import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
  preSerializationHookHandler,
  preValidationHookHandler,
} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import Hashids from 'hashids';
import utils from './utils';

declare module 'fastify' {
  interface FastifyInstance {
    hashids: Hashids;
  }
}

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

  fastify.decorate('hashids', hashids);

  const idRegexp =
    options.hashidsOptions?.idRegex || /^(id|ID|Id|\w+(id|ID|Id))$/;

  const encoder = new utils.Encoder({ idRegexp, hashids });
  const decoder = new utils.Decoder({ idRegexp, hashids });

  const decodableRequestProperties = ['params', 'query', 'body'] as const;

  function encodePayloadHook(
    _: FastifyRequest,
    __: FastifyReply,
    payload: unknown,
    done: (err?: Error | null, payload?: unknown) => void,
  ): void {
    if (utils.isObject(payload)) {
      return done(null, encoder.encodeObject(payload));
    }

    if (utils.isArray(payload)) {
      return done(null, encoder.encodeArray(payload));
    }

    done(null, payload);
  }

  function createRequestDecoderHook(
    property: typeof decodableRequestProperties[number],
  ): preValidationHookHandler {
    return (request, _, done) => {
      const input = request[property];

      if (utils.isObject(input)) {
        request[property] = decoder.decodeObject(input);
      }

      done();
    };
  }

  fastify.addHook('onRoute', (routeOptions) => {
    const requestDecoderHooks = decodableRequestProperties.map((value) =>
      createRequestDecoderHook(value),
    );

    const existingPreValidationHooks =
      (routeOptions.preValidation as preValidationHookHandler[]) || [];

    routeOptions.preValidation = [
      ...requestDecoderHooks,
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

export default fastifyPlugin(plugin);
