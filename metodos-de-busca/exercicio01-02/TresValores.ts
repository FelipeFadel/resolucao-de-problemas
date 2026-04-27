export default class TresValores {
  private a: number;
  private b: number;
  private c: number;

  public constructor(a: number, b: number, c: number) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  // Exercício 1
  public ordenaTres(): void {
    let aux: number;

    if (this.a > this.b) {
      aux = this.a;
      this.a = this.b;
      this.b = aux;
    }
    
    if (this.a > this.c) {
      aux = this.a;
      this.a = this.c;
      this.c = aux;
    }
    
    if (this.b > this.c) {
      aux = this.b;
      this.b = this.c;
      this.c = aux;
    }
  }

  // Exercício 2
  public maiorDeTres(): number {
    let maior: number = this.a;

    if (this.b > maior) {
      maior = this.b;
    }

    if (this.c > maior) {
      maior = this.c;
    }

    return maior;
  }

  public getValores(): number[] {
    return [this.a, this.b, this.c];
  }
}
