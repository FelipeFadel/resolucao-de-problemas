export default class Inteiro {
  private n: number;

  public constructor(n: number) {
    this.n = Math.abs(n);
  }

  // get() e set()

  public fatorial(): number {
    return this.fatorialAux(this.n);
  }

  private fatorialAux(x: number): number {
    if (x < 2)
      return 1;

    return x * this.fatorialAux(x-1);
  }

  public potencia(expoente: number): number {
    expoente = Math.abs(expoente);
    if (expoente == 0)
      return 1;

    if (this.n < 2)
      return this.n;

    return this.n * this.potencia(expoente - 1);
  }

  public fibo(): number {
    return this.fiboAux(this.n);
  }

  private fiboAux(x: number): number {
    // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
    if (x == 0)
      return -1;  // Não existe

    if (x == 1)
      return 0;

    if (x < 4)
      return 1;

    return this.fiboAux(x-1) + this.fiboAux(x-2);
  }
}