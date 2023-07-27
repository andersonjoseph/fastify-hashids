import Hashids from 'hashids';
import { IdChecker } from './id-checker';
import utils from './index';

type EncoderOptions = {
  readonly hashids: Hashids;
  readonly idChecker: IdChecker;
};

export class Encoder {
  constructor(private readonly options: EncoderOptions) {}

  encodeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const outputObject: Record<string, unknown> = structuredClone(obj);

    const keys = Object.keys(outputObject);

    for (const key of keys) {
      const currentValue = outputObject[key];

      // disable-prettier
      if (utils.isObject(currentValue)) {
        outputObject[key] = this.encodeObject(currentValue);
      }
      // disable-prettier
      else if (utils.isArray(currentValue)) {
        outputObject[key] = this.options.idChecker.propertyIsId(key)
          ? (outputObject[key] = this.encodeArrayOfIds(currentValue))
          : (outputObject[key] = this.encodeArray(currentValue));
      }
      // disable-prettier
      else if (this.options.idChecker.propertyIsId(key)) {
        outputObject[key] = this.options.hashids.encode(String(currentValue));
      }
    }

    return outputObject;
  }

  encodeArrayOfIds(arr: unknown[]): unknown[] {
    return arr.map((value) => this.options.hashids.encode(String(value)));
  }

  encodeArray(arr: unknown[]): unknown[] {
    const outputArray: Array<unknown> = [];

    for (const value of arr) {
      if (utils.isObject(value)) {
        outputArray.push(this.encodeObject(value));
      } else if (utils.isArray(value)) {
        outputArray.push(this.encodeArray(value));
      } else {
        outputArray.push(value);
      }
    }

    return outputArray;
  }
}
