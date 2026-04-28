export default class SudokuMelhorado {
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
    const linhas = Array.from({ length: 9 }, () => new Set<number>());
    const colunas = Array.from({ length: 9 }, () => new Set<number>());
    const blocos = Array.from({ length: 9 }, () => new Set<number>());

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const valor = this.tabuleiro[i][j];

        // valida intervalo
        if (valor < 1 || valor > 9) {
          this.error = `Linha ${i + 1}, coluna ${j + 1}: o número deve estar entre 1 e 9;`;
          return false;
        }

        const blocoIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);

        // valida linha
        if (linhas[i].has(valor)) {
          this.error = `Linha ${i + 1}: o número ${valor} já está presente nesta linha;`;
          return false;
        }

        // valida coluna
        if (colunas[j].has(valor)) {
          this.error = `Coluna ${j + 1}: o número ${valor} já está presente nesta coluna;`;
          return false;
        }

        // valida bloco
        if (blocos[blocoIndex].has(valor)) {
          this.error = `Linha ${i + 1}, coluna ${j + 1}: o número ${valor} já está presente nesta região;`;
          return false;
        }

        // adiciona aos sets
        linhas[i].add(valor);
        colunas[j].add(valor);
        blocos[blocoIndex].add(valor);
      }
    }

    return true;
  }
}
