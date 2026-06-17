import { readFileSync } from "fs";

// le a entrada e devolve um valor por vez
class Scanner {
  private tokens: string[];
  private pos = 0;

  constructor(raw: string) {
    this.tokens = raw.split(/\s+/).filter((token) => token.length > 0);
  }

  public nextInt(): number {
    return parseInt(this.tokens[this.pos++], 10);
  }

  public nextFloat(): number {
    return parseFloat(this.tokens[this.pos++]);
  }

  public nextToken(): string {
    return this.tokens[this.pos++];
  }

  public hasNext(): boolean {
    return this.pos < this.tokens.length;
  }
}

// resolve um caso e devolve a string pra imprimir
function resolverCaso(scanner: Scanner): string {
  return "";
}

function main(): void {
  const scanner = new Scanner(readFileSync("/dev/stdin", "utf8"));
  const saida: string[] = [];

  // se o problema tem t no inicio
  const T = scanner.nextInt();
  for (let i = 0; i < T; i++) {
    saida.push(resolverCaso(scanner));
  }

  // se nao tem t troque pelo while abaixo
  // while (scanner.hasNext()) {
  //   saida.push(resolverCaso(scanner));
  // }

  console.log(saida.join("\n"));
}

main();

//No Windows, os passos seriam:
// abra o terminal (PowerShell ou cmd) na pasta raiz do projeto, a mesma onde está o tsconfig.json
// rode npm init -y (cria um package.json básico, só precisa fazer isso uma vez)
// rode npm install --save-dev @types/node
