import Hashids from 'hashids';

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
      if (this.options.idRegexp.test(key)) {
        outputObject[key] = this.decodeString(String(outputObject[key]));
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
