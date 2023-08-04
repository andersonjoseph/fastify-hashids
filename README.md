# Fastify Hashids Plugin

[![License](https://img.shields.io/github/license/andersonjoseph/fastify-hashids)](https://github.com/andersonjoseph/fastify-hashids/blob/main/LICENSE)
[![npm version](https://badge.fury.io/js/fastify-hashids.svg)](https://badge.fury.io/js/fastify-hashids)
[![ci](https://github.com/andersonjoseph/fastify-hashids/actions/workflows/node.js.yml/badge.svg)](https://github.com/andersonjoseph/fastify-hashids/actions/workflows/node.js.yml)

A Fastify plugin for integrating [Hashids](https://github.com/niieani/hashids.js) into your routes, providing an easy way to encode and decode data, particularly useful for obscuring database IDs.

## Installation

```bash
pnpm install fastify-hashids
```

## Usage

```typescript
import fastify from 'fastify';
import fastifyHashids from 'fastify-hashids';

const app = fastify();

await app.register(fastifyHashids, {
  hashidsOptions: {
    salt: 'your-secret-salt',
    minLength: 8,
    // Additional Hashids options if needed
  },
});

app.get('/', (request, reply) => {
  const id = 123;
  return {
    encodedId: id,
    idWithoutEncoding: id,
  };
});

await fastify.listen({ port: 3000 });
```

```sh
curl http://localhost:3000
```

the response will look like this:

```sh
{
  "encodedId":"Mj3",
  "idWithoutEncoding":123
}
```

## Options

The `hashidsOptions` object is an optional object that can be passed to the `Hashids` constructor to customize the behavior of the hashids library.

The following properties are supported:

- `salt`: A string that is used to randomize the hashids.
- `minLength`: The minimum length of the hashids.
- `alphabet`: A string that contains the characters that can be used in the hashids. The default value is "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".
- `seps`: The `seps` option is a string that contains the characters that should not be placed next to each other in the hashids. The default value is "cfhistu". This option is used to avoid generating hashids that could be interpreted as curse words in English.
- `idRegexp`: A regular expression that fastify-hashids uses to automatically identify properties as IDs. By default, it matches variations of "id, ids, ID, userID," etc. You can customize this regex to match your specific property names. Pass null to disable the regex-based property identification.
- `propertyList`: An array of property names to include in the hashing process. Properties listed here will be considered for encoding with Hashids, in addition to those identified by the idRegexp.

## Route-Level Configuration

You can disable the Hashids functionality for specific routes by adding the `disableHashids` property to the route's configuration object:

```typescript
app.get(
  '/api/sensitive-data',
  {
    config: {
      disableHashids: true,
    },
  },
  async (req, reply) => {
    // ... handle route without Hashids encoding
  },
);
```

## Accessing the Hashids Instance

When the `fastify-hashids` plugin is registered, the `fastify` instance is decorated with a `hashids` instance. This means that you can access the `hashids` instance directly from the `fastify` instance.

For example, the following code would encode the number 12345 using the `hashids` instance:

```typescript
import fastify from 'fastify';
import hashids from 'fastify-hashids';

await fastify.register(hashids);

const hash = fastify.hashids.encode(12345);
const id = fastify.hashids.decode(hash);
```

## License

This project is licensed under the [MIT License](https://github.com/andersonjoseph/fastify-hashids/blob/main/LICENSE).

## Contributing

Contributions are welcome! If you find a bug, have suggestions for improvement, or want to add new features, please open an issue or create a pull request.