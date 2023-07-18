import { Encoder } from './encoder';
import { Decoder } from './decoder';
import { IdChecker } from './id-checker';

function isObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}

export default {
  isObject,
  isArray,
  Encoder,
  Decoder,
  IdChecker,
};
