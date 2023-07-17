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

      if (this.options.idRegexp.test(key)) {
        outputObject[key] = this.options.hashids.decode(
          String(outputObject[key]),
        )[0];
      } else if (utils.isObject(currentValue)) {
        outputObject[key] = this.decodeObject(currentValue);
      } else if (utils.isArray(currentValue)) {
        outputObject[key] = this.decodeArray(currentValue);
      }
    }

    return outputObject;
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
