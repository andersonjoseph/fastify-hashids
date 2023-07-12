import Hashids from 'hashids';

type DecoderOptions = {
  readonly hashids: Hashids;
  readonly idRegexp: RegExp;
};

export class Decoder {
  constructor(private readonly options: DecoderOptions) {}

  decodeString(str: string): number | bigint {
    return this.options.hashids.decode(str)[0] || -1;
  }

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
}
