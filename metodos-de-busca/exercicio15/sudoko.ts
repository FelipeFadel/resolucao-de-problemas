export default class Sudoku {
  private tabuleiro: number[][];
  private error: string;

  constructor(tabuleiro: number[][]) {
    this.tabuleiro = tabuleiro;
    this.error = "";
  }

  public getTabuleiro() {
    for (const linha of this.tabuleiro) {
      console.log(linha.join(" "));
    }
  }

  public getError(): string {
    return this.error;
  }

  public isValid(): boolean {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.tabuleiro[i][j] < 1 || this.tabuleiro[i][j] > 9) {
          this.error = `Linha ${i + 1}, coluna ${j + 1}: o número deve estar entre 1 e 9;`;
          return false;
        }
        for (let k = 0; k < 9; k++) {
          if (k !== j && this.tabuleiro[i][j] === this.tabuleiro[i][k]) {
            this.error = `Linha ${i + 1}: o número ${this.tabuleiro[i][j]} já está presente nesta linha;`;
            return false;
          }
        }
        for (let k = 0; k < 9; k++) {
          if (k !== i && this.tabuleiro[i][j] === this.tabuleiro[k][j]) {
            this.error = `Coluna ${j + 1}: o número ${this.tabuleiro[i][j]} já está presente nesta coluna;`;
            return false;
          }
        }

        const valor = this.tabuleiro[i][j];
        const blocoLinha = Math.floor(i / 3) * 3;
        const blocoColuna = Math.floor(j / 3) * 3;

        for (let x = blocoLinha; x < blocoLinha + 3; x++) {
          for (let y = blocoColuna; y < blocoColuna + 3; y++) {
            if ((x !== i || y !== j) && this.tabuleiro[x][y] === valor) {
              this.error = `Linha ${i + 1}, coluna ${j + 1}: o número ${valor} já está presente nesta região;`;
              return false;
            }
          }
        }
      }
    }
    return true;
  }
}
