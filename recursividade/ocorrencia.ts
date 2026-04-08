export class Ocorrencia {
  private array: number[];

  public constructor(array: number[]) {
    this.array = array;
  }
  public primeiraOcorrencia(search: number, i: number = 0): number {
    if (i >= this.array.length) return -1;
    if (this.array[i] === search) return i;

    return this.primeiraOcorrencia(search, i + 1);
  }
  public primOrdenado(search: number, i: number = 0): number {
    i = this.array.length / 2;
    if (this.array[i] === search) return i;
    if (this.array[i] > search)
      return this.primOrdenado(search, i + (this.array.length - i) / 2);
    return this.primOrdenado(search, i / 2);
  }
}
