import Busca from "../busca";

export default class MegaSena {
  private cartao: number[];
  private buscador: Busca;

  public constructor(cartao: number[]) {
    if (cartao.length < 6 || cartao.length > 20) {
      throw new Error("O cartão deve ter entre 6 e 20 números.");
    }
    this.cartao = cartao;
    this.buscador = new Busca();
  }

  public conferirAcertos(sorteio: number[]): number {
    let acertos = 0;
    for (let i = 0; i < sorteio.length; i++) {
      if (this.buscador.buscaBinaria(this.cartao, sorteio[i])) {
        acertos++;
      }
    }
    return acertos;
  }

  public obterResultado(sorteio: number[]): string {
    const acertos = this.conferirAcertos(sorteio);
    switch (acertos) {
      case 6:
        return "sena";
      case 5:
        return "quina";
      case 4:
        return "quadra";
      default:
        return "não premiado";
    }
  }
}
