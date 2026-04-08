/*MASCHIO, Eleandro. Recursividade: Exercícios de Revisão. Guarapuava: Universidade
Tecnológica Federal do Paraná, 2024. 2 p. Material didático da disciplina de Resolução de
Problemas.*/

export class Mensagem {
  private mensagem: string;

  public constructor(mensagem: string = "Resolução de problemas") {
    this.mensagem = mensagem;
  }

  public printMensagem(n: number, mensagem: string = this.mensagem): void {
    if (n < 1) return;
    console.log(mensagem);
    this.printMensagem(n - 1, mensagem);
  }
}
