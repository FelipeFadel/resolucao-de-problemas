export default class MatrizInteira {
  readonly TAM: number = 20;
  private m: number[];

  public constructor() {
    this.m = [];

    for (let i = 0; i < this.TAM; i++)
      this.m[i] = Math.ceil(Math.random() * 5);
  }

  public toString(): string {
    return this.m.toString();
  }

  public primeiraOcorrencia(n: number): number {
    return this.primeiraOcorrenciaAux(n, 0);
  }

  private primeiraOcorrenciaAux(n: number, pos: number): number {
    if (pos >= this.TAM)
      return -1;

    if (this.m[pos] == n)
      return pos;

    return this.primeiraOcorrenciaAux(n, pos + 1);
  }

  public somaDosElementos(): number {
    return this.somaDosElementosAux(0);
  }

  private somaDosElementosAux(pos: number): number {
    if (pos >= this.TAM)
      return 0;

    return this.m[pos] + this.somaDosElementosAux(pos + 1);
  }

  public maiorElemento(): number {
    return this.maiorElementoAux(0);
  }

  private maiorElementoAux(pos: number): number {
    if (pos == this.TAM-1)
      return this.m[this.TAM-1];

    let maior: number = this.maiorElementoAux(pos + 1);
    if (this.m[pos] > maior)
      return this.m[pos];

    return maior;
  }

  public numeroDeOcorrencias(n: number): number {
    return this.numeroDeOcorrenciasAux(n, 0);
  }

  private numeroDeOcorrenciasAux(n: number, pos: number): number {
    if (pos >= this.TAM)
      return 0;

    let atual = 0;

    if (this.m[pos] == n)
      atual = 1;

    return atual + this.numeroDeOcorrenciasAux(n, pos + 1);
  }

  public isOrdenado(): boolean {
    return this.isOrdenadoAux(0);
  }

  private isOrdenadoAux(pos: number): boolean {
    if (pos >= this.TAM-1)
      return true;

    if (this.m[pos] > this.m[pos+1])
      return false;

    return this.isOrdenadoAux(pos + 1);
  }

  public ordena(): void {
    // Para depois testar se a matriz está ordenada.
    this.m.sort();
  }
}