class Fibonacci {
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

const fibonacci = new Fibonacci();

for (let i = 1; i <= 8; i++) {
  console.log(fibonacci.fibonacci(i));
}

console.log("\nTribonacci:");

for (let i = 1; i <= 8; i++) {
  console.log(fibonacci.tribonacci(i));
}

console.log("\nTretanacci:");

for (let i = 1; i <= 8; i++) {
  console.log(fibonacci.tretanacci(i));
}
