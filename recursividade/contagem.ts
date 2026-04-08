/*MASCHIO, Eleandro. Recursividade: Exercícios de Revisão. Guarapuava: Universidade
Tecnológica Federal do Paraná, 2024. 2 p. Material didático da disciplina de Resolução de
Problemas.*/

export class Contagem {
  public contagemProgressiva(n: number): number {
    console.log(n);

    if (n === 0) return 0;
  }
  public contagemRegressiva(n: number): void {
    console.log(n);

    if (n === 0) return;

    this.contagemRegressiva(n - 1);
  }
  public contagemIntervalo(a: number, b: number): void {
    console.log(n);

    if (n === 0) return;

    this.contagemProgressiva(n - 1);
  }
}
