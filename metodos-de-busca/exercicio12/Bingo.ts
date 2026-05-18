export default class Bingo {
  private cartela: number[][];

  constructor() {
    this.cartela = this.gerarCartela();
  }

  private gerarCartela(): number[][] {
    const numerosSorteados = new Set<number>();
    const cartela: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));

    for (let linha = 0; linha < 5; linha++) {
      for (let coluna = 0; coluna < 5; coluna++) {
        let numero: number;
        do {
          // Números de 1 a 50
          numero = Math.floor(Math.random() * 50) + 1;
        } while (numerosSorteados.has(numero));

        numerosSorteados.add(numero);
        cartela[linha][coluna] = numero;
      }
    }

    return cartela;
  }

  public toString(): string {
    let output = " B  I  N  G  O\n";
    for (let linha = 0; linha < 5; linha++) {
      let linhaStr = "";
      for (let coluna = 0; coluna < 5; coluna++) {
        // Formata os números com espaços para alinhar
        linhaStr += this.cartela[linha][coluna].toString().padStart(2, " ") + " ";
      }
      output += linhaStr.trimEnd() + "\n";
    }
    return output;
  }
}
