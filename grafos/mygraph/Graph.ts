export default class Graph<T> {
  private adjacencia: Map<T, T[]>;

  constructor() {
    this.adjacencia = new Map();
  }

  public addNode(valor: T): void {
    if (!this.adjacencia.has(valor)) {
      this.adjacencia.set(valor, []);
    }
  }

  public addEdge(origem: T, destino: T): void {
    this.addNode(origem);
    this.addNode(destino);
    this.adjacencia.get(origem)!.push(destino);
    this.adjacencia.get(destino)!.push(origem);
  }

  public vizinhos(valor: T): T[] {
    return this.adjacencia.get(valor) ?? [];
  }

  public grau(valor: T): number {
    return this.vizinhos(valor).length;
  }

  public removeNode(valor: T): void {
    this.adjacencia.delete(valor);
    for (const [no, vizinhos] of this.adjacencia) {
      this.adjacencia.set(
        no,
        vizinhos.filter((vizinho) => vizinho !== valor),
      );
    }
  }

  public everyWays(origem: T, destino: T): T[][] {
    const caminhos: T[][] = [];

    const buscar = (atual: T, caminho: T[]): void => {
      if (atual === destino) {
        caminhos.push(caminho);
        return;
      }
      for (const vizinho of this.vizinhos(atual)) {
        if (!caminho.includes(vizinho)) {
          buscar(vizinho, [...caminho, vizinho]);
        }
      }
    };

    buscar(origem, [origem]);
    return caminhos;
  }

  public shortWay(origem: T, destino: T): T[] | null {
    const visitados = new Set<T>([origem]);
    const fila: T[][] = [[origem]];

    while (fila.length > 0) {
      const caminho = fila.shift()!;
      const atual = caminho[caminho.length - 1];

      if (atual === destino) {
        return caminho;
      }

      for (const vizinho of this.vizinhos(atual)) {
        if (!visitados.has(vizinho)) {
          visitados.add(vizinho);
          fila.push([...caminho, vizinho]);
        }
      }
    }

    return null;
  }

  public print(): void {
    for (const [valor, vizinhos] of this.adjacencia) {
      console.log(`${valor} -> [${vizinhos.join(", ")}]`);
    }
  }
}
