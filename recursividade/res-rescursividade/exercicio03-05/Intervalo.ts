export default class Intervalo {
  private a: number;
  private b: number;

  public constructor(a: number, b: number) {
    this.a = a;
    this.b = b;
  }

  // get() e set()

  public contagem(): void {
    this.contagemAux(this.a);
  }

  private contagemAux(inicio: number): void {
    if (inicio > this.b)
      return;

    // Não sendo uma classe de interface, retornar uma string.
    console.log(inicio);
    this.contagemAux(inicio + 1);
  }

  public soma(): number {
    return this.somaAux(this.a);
  }

  private somaAux(inicio: number): number {
    if (inicio > this.b)
      return 0;

    return inicio + this.somaAux(inicio + 1);
  }
}