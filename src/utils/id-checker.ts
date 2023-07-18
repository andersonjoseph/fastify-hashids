type IdCheckerOptions = {
  idRegexp?: RegExp | null;
  propertyList?: string[];
};

const defaultIdRegexp = /^\w*((id|iD)s?|(Id|Ids|ID(s|S)?))$/;

export class IdChecker {
  private readonly idRegexp: RegExp | null;
  private readonly propertyList?: string[];

  constructor(options: IdCheckerOptions) {
    if (options.idRegexp === null) {
      this.idRegexp = null;
    } else {
      this.idRegexp = options.idRegexp ?? defaultIdRegexp;
    }

    this.propertyList = options.propertyList;
  }

  propertyIsId(property: string): boolean {
    let result = false;

    if (this.idRegexp) {
      result ||= this.idRegexp.test(property);
    }

    if (this.propertyList) {
      result ||= this.propertyList.some(
        (propertyInList) => propertyInList === property,
      );
    }

    return result;
  }
}
