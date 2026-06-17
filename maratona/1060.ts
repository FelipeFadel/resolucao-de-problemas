import { readFileSync } from "fs";

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
}

/**
 * Classe de domínio do problema: representa uma cidade com população
 * e taxa de crescimento. Mantém a mesma ideia de POO que vocês já
 * usam no Graph/BinaryTree — a entrada só decide os valores iniciais.
 */
class City {
  private population: number;
  private readonly growthRate: number;

  constructor(population: number, growthRate: number) {
    this.population = population;
    this.growthRate = growthRate;
  }

  /** Aplica um ano de crescimento. A população é sempre inteira (arredonda pra baixo). */
  public grow(): void {
    this.population = Math.floor(
      this.population + this.population * (this.growthRate / 100),
    );
  }

  public getPopulation(): number {
    return this.population;
  }
}

const LIMITE_ANOS = 100;

/**
 * Simula ano a ano até a cidade A superar a cidade B.
 * Retorna null se passar de 100 anos (corta antes pra não dar TLE).
 */
function anosParaSuperar(cidadeA: City, cidadeB: City): number | null {
  let anos = 0;

  while (cidadeA.getPopulation() <= cidadeB.getPopulation()) {
    cidadeA.grow();
    cidadeB.grow();
    anos++;

    if (anos > LIMITE_ANOS) return null;
  }

  return anos;
}

function resolverCaso(scanner: Scanner): string {
  const pa = scanner.nextInt();
  const pb = scanner.nextInt();
  const g1 = scanner.nextFloat();
  const g2 = scanner.nextFloat();

  const cidadeA = new City(pa, g1);
  const cidadeB = new City(pb, g2);

  const anos = anosParaSuperar(cidadeA, cidadeB);

  return anos === null ? "Mais de 1 seculo." : `${anos} anos.`;
}

function main(): void {
  const scanner = new Scanner(readFileSync("/dev/stdin", "utf8"));
  const saida: string[] = [];

  const T = scanner.nextInt();
  for (let i = 0; i < T; i++) {
    saida.push(resolverCaso(scanner));
  }

  console.log(saida.join("\n"));
}

main();
