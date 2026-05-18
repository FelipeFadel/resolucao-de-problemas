export class List {
  private data: number[];

  constructor(data: number[]) {
    this.data = data;
  }

  public getSublist(n: number): number[] {
    const result: number[] = [];

    if (n === 0) return result;

    if (n > 0) {
      for (let i = 0; i < this.data.length; i += n) {
        result.push(this.data[i]);
      }
    } else {
      const inicio = this.data.length + n;

      if (inicio < 0) return result;

      for (let i = inicio; i >= 0; i += n) {
        result.push(this.data[i]);
      }
    }

    return result;
  }
}
