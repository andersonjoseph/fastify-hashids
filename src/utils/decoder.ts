import Hashids from 'hashids';
import utils from './index';

type DecoderOptions = {
  readonly hashids: Hashids;
  readonly idRegexp: RegExp;
};

export class Decoder {
  constructor(private readonly options: DecoderOptions) {}

  decodeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const outputObject: Record<string, unknown> = JSON.parse(
      JSON.stringify(obj),
    );

    const keys = Object.keys(outputObject);

    for (const key of keys) {
      const currentValue = outputObject[key];

      if (utils.isObject(currentValue)) {
        outputObject[key] = this.decodeObject(currentValue);
      } else if (utils.isArray(currentValue)) {
        outputObject[key] = this.options.idRegexp.test(key)
          ? this.decodeArrayOfIds(currentValue)
          : this.decodeArray(currentValue);
      } else if (this.options.idRegexp.test(key)) {
        outputObject[key] = this.options.hashids.decode(
          String(outputObject[key]),
        )[0];
      }
    }

    return outputObject;
  }

  decodeArrayOfIds(arr: unknown[]): unknown[] {
    const outputArray: Array<unknown> = [];

    for (const value of arr) {
      outputArray.push(this.options.hashids.decode(String(value))[0]);
    }

    return outputArray;
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
