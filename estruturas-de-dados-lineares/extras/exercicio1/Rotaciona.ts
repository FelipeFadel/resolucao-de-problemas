// ROTACIONA
//
// Implemente uma classe denominada Rotaciona que receba, no construtor, uma
// matriz unidimensional de inteiros. Forneca um metodo denominado rotate()
// que receba um inteiro n e retorne uma nova matriz com os elementos rotacionados.
//
// Se n for positivo, os elementos se deslocam para a direita (os ultimos vao para o inicio).
// Se n for negativo, os elementos se deslocam para a esquerda (os primeiros vao para o fim).
// Se n for zero ou multiplo do tamanho, o array retorna igual.
// Valores de n maiores que o tamanho do array devem ser tratados corretamente.
//
// Exemplo 1
// Construtor: [1, 2, 3, 4, 5]
// n: 2
// Retorno: [4, 5, 1, 2, 3]
//
// Exemplo 2
// Construtor: [1, 2, 3, 4, 5]
// n: -1
// Retorno: [2, 3, 4, 5, 1]
//
// Exemplo 3
// Construtor: [1, 2, 3, 4, 5]
// n: 7
// Retorno: [4, 5, 1, 2, 3]  (equivalente a n=2, pois 7 % 5 = 2)
//
// Exemplo 4
// Construtor: [1, 2, 3, 4, 5]
// n: 0
// Retorno: [1, 2, 3, 4, 5]
export class Rotaciona {
  private data: number[];

  constructor(data: number[]) {
    this.data = data;
  }

  public rotate(n: number): number[] {
    const result: number[] = [];
    const len = this.data.length;

    if (len === 0) return result;

    // normaliza: transforma qualquer n no equivalente entre 0 e len-1
    const shift = ((n % len) + len) % len;

    for (let i = 0; i < len; i++) {
      result.push(this.data[(i - shift + len) % len]);
    }

    return result;
  }
}
