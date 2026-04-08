export class Inteiro {
  private n: number;
  public constructor(n: number) {
    this.n = Math.abs(n);
  }

  public get(): number {
    return this.n;
  }
  public set(n: number): void {
    this.n = n;
  }

  public fatorial(): number {
    return this.fatorialAux(this.n);
  }

  private fatorialAux(x: number): number {
    if (x < 2) return 1;

    return x * this.fatorialAux(x - 1);
  }

  public potencia(base: number, exponte: number): number {
    if (exponte < 1) return 1;

    return base * this.potencia(base, exponte - 1);
  }

  public fibonacci(n: number): number {
    let cache = new Array<number>(n + 1).fill(0);
    return this.fibonacciRecursiva(n, cache);
  }

  //FIBONACCI 1, 1, 2, 3, 5, 8, 13, 21
  private fibonacciRecursiva(n: number, cache: number[]): number {
    if (n < 1) return 0;
    if (n < 2) cache[n] = 1;

    if (cache[n] != 0) return cache[n];

    cache[n] = this.fibonacciRecursiva(n - 1, cache) + cache[n - 2];
    return cache[n];
  }

  public tribonacci(n: number): number {
    let cache = new Array<number>(n + 1).fill(0);
    return this.tribonacciRecursiva(n, cache);
  }

  //TRIBONACCI: 0, 1, 1, 2, 4, 7, 13, 24
  private tribonacciRecursiva(n: number, cache: number[]): number {
    if (n < 1) return 0;
    if (n < 3) cache[n] = 1;

    if (cache[n] != 0) return cache[n];

    cache[n] =
      this.tribonacciRecursiva(n - 1, cache) +
      this.tribonacciRecursiva(n - 2, cache) +
      cache[n - 3];
    return cache[n];
  }

  public tretanacci(n: number): number {
    let cache = new Array<number>(n + 1).fill(0);
    return this.tretanacciRecursiva(n, cache);
  }

  //TRETANACCI: 1, 1, 2, 4, 8, 15, 29, 56
  private tretanacciRecursiva(n: number, cache: number[]): number {
    if (n < 1) return 0;
    if (n < 3) cache[n] = 1;

    if (cache[n] != 0) return cache[n];

    cache[n] =
      this.tretanacciRecursiva(n - 1, cache) +
      this.tretanacciRecursiva(n - 2, cache) +
      this.tretanacciRecursiva(n - 3, cache) +
      this.tretanacciRecursiva(n - 4, cache);
    return cache[n];
  }
}
