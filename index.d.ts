export = Ware;
declare class Ware<T> {
  constructor(fn?: T);
  private _fns: T[];
  private _compose(): (...args: T[]) => Promise<any>;
  use(fn: T): Ware<T>;
  run(...args: any[]): Promise<any>;
}
