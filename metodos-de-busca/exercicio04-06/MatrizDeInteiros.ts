export default class MatrizDeInteiros {
  readonly TAM: number = 20;
  private m: number[];

  public constructor(matriz: number[]) {
    this.m = [...matriz];
  }

  // Exercício 4
  public isCrescente(): boolean {
    for (let i = 0; i < this.TAM - 1; i++) {
      if (this.m[i] > this.m[i + 1]) {
        return false;
      }
    }
    return true;
  }

  // Exercício 5
  public bubbleSortMelhorado(): void {
    let trocou: boolean;
    for (let i = 0; i < this.TAM - 1; i++) {
      trocou = false;

      for (let j = 0; j < this.TAM - i - 1; j++) {
        if (this.m[j] > this.m[j + 1]) {
          let aux = this.m[j];
          this.m[j] = this.m[j + 1];
          this.m[j + 1] = aux;
          trocou = true;
        }
      }

      if (!trocou) {
        break;
      }
    }
  }

  // Exercício 6
  public embaralhar(): void {
    for (let i = this.TAM - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      const aux = this.m[i];
      this.m[i] = this.m[j];
      this.m[j] = aux;
    }
  }

  public getMatriz(): number[] {
    return this.m;
  }
}
