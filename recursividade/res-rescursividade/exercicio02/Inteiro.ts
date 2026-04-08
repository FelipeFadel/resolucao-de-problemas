export default class Inteiro {
  private n: number;

  public constructor(n: number) {
    this.n = n;
  }

  // get() e set()

  public contagemProgressiva(): void {
    this.contagemProgressivaAux(this.n);
  }

  private contagemProgressivaAux(x: number): void {
    if (x <= 0)
      return;

    this.contagemProgressivaAux(x-1);
    console.log(x);
    // Não sendo uma classe de interface, retornar uma string.
  }
}