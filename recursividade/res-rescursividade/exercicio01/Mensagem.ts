export default class Mensagem {
  private mensagem: string;

  public constructor(mensagem: string) {
    this.mensagem = mensagem;
  }

  // get() e set()

  public exibe(n: number): void {
    if (n <= 0)
      return;

    // Não sendo uma classe de interface, retornar uma string.
    console.log(this.mensagem);
    this.exibe(n-1);
  }
}