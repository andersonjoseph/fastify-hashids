import Hashids from 'hashids';
import { IdChecker } from './id-checker';
import utils from './index';

type DecoderOptions = {
  readonly hashids: Hashids;
  readonly idChecker: IdChecker;
};

export class Decoder {
  constructor(private readonly options: DecoderOptions) {}

  decodeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const outputObject: Record<string, unknown> = structuredClone(obj);

    const keys = Object.keys(outputObject);

    for (const key of keys) {
      const currentValue = outputObject[key];

      // disable-prettier
      if (utils.isObject(currentValue)) {
        outputObject[key] = this.decodeObject(currentValue);
      }
      // disable-prettier
      else if (utils.isArray(currentValue)) {
        outputObject[key] = this.options.idChecker.propertyIsId(key)
          ? this.decodeArrayOfIds(currentValue)
          : this.decodeArray(currentValue);
      }
      // disable-prettier
      else if (this.options.idChecker.propertyIsId(key)) {
        outputObject[key] = this.options.hashids.decode(
          String(currentValue),
        )[0];
      }
    }

    return outputObject;
  }

  decodeArrayOfIds(arr: unknown[]): unknown[] {
    return arr.map((value) => this.options.hashids.decode(String(value))[0]);
  }

  decodeArray(arr: unknown[]): unknown[] {
    const outputArray: Array<unknown> = [];

    for (const value of arr) {
      if (utils.isObject(value)) {
        outputArray.push(this.decodeObject(value));
      } else if (utils.isArray(value)) {
        outputArray.push(this.decodeArray(value));
      } else {
        outputArray.push(value);
      }
    }

    return outputArray;
  }
}
