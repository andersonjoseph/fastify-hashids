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
import { InvalidIdError } from './errors';
import utils from './utils';
import { IdChecker } from './utils/id-checker';

declare module 'fastify' {
  interface FastifyInstance {
    hashids: Hashids;
  }

  interface FastifyContextConfig {
    disableHashids?: boolean;
  }
}

export type HashidsPluginOptions = {
  hashidsOptions?: {
    salt?: string;
    minLength?: number;
    alphabet?: string;
    seps?: string;
    idRegexp?: RegExp | null;
    propertyList?: string[];
  };
};

export default function plugin(
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

  const idChecker = new IdChecker({
    idRegexp: options.hashidsOptions?.idRegexp,
    propertyList: options.hashidsOptions?.propertyList,
  });

  const encoder = new utils.Encoder({ idChecker, hashids });
  const decoder = new utils.Decoder({ idChecker, hashids });

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
        try {
          request[property] = decoder.decodeObject(input);
        } catch (err) {
          throw new InvalidIdError();
        }
      }

      done();
    };
  }

  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.config?.disableHashids) {
      return;
    }

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

module.exports = fastifyPlugin(plugin);
module.exports.default = fastifyPlugin(plugin);
