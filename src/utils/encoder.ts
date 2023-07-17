import Hashids from 'hashids';
import utils from './index';

type EncoderOptions = {
  readonly hashids: Hashids;
  readonly idRegexp: RegExp;
};

export class Encoder {
  constructor(private readonly options: EncoderOptions) {}

  encodeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const outputObject: Record<string, unknown> = JSON.parse(
      JSON.stringify(obj),
    );

    const keys = Object.keys(outputObject);

    for (const key of keys) {
      const currentValue = outputObject[key];

      if (utils.isObject(currentValue)) {
        outputObject[key] = this.encodeObject(currentValue);
      } else if (utils.isArray(currentValue)) {
        outputObject[key] = this.encodeArray(currentValue);
      } else if (this.options.idRegexp.test(key)) {
        outputObject[key] = this.options.hashids.encode(
          String(outputObject[key]),
        );
      }
    }

    return outputObject;
  }

  encodeArray(arr: unknown[]): unknown[] {
    const outputArray: Array<unknown> = [];

    for (const value of arr) {
      if (utils.isObject(value)) {
        outputArray.push(this.encodeObject(value));
      } else if (utils.isArray(value)) {
        outputArray.push(...this.encodeArray(value));
      } else {
        outputArray.push(value);
      }
    }

    return outputArray;
  }
}
