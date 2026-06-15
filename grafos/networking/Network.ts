export default class Network {
  private conections: Map<string, string[]>;

  constructor() {
    this.conections = new Map();
  }

  public addNode(filial: string): void {
    if (!this.conections.has(filial)) {
      this.conections.set(filial, []);
    }
  }

  public print(value: string): void {
    for (const [value, vizinhos] of this.conections) {
      console.log(`${value} -> [${vizinhos.join(", ")}]`);
    }
  }

  public add(source: string, end: string): boolean {
    this.addNode(source);
    this.addNode(end);
    this.conections.get(source)!.push(end);
    this.conections.get(end)!.push(source);

    return true;
  }

  public getNotConnected(value: string): string[] {
    const connected = this.getConnected(value);
    const notConnected: string[] = [];

    const filiais = Array.from(this.conections.keys());

    for (let i = 0; i < filiais.length; i++) {
      const filial = filiais[i];

      if (filial !== value && connected.includes(filial) === false) {
        notConnected.push(filial);
      }
    }

    return notConnected.sort();
  }

  public getConnected(value: string): string[] {
    const visited: string[] = [];
    const connecteds: string[] = [...(this.conections.get(value) ?? [])]; //Cria uma copia do array ligado a value encontrado no map, o operado ... serve para distribuir os valores dentro do array

    while (connecteds.length > 0) {
      const atual = connecteds.shift(); //Remove do inicio do array, analogo a estrutura de fila

      if (
        atual !== undefined &&
        atual !== value &&
        visited.includes(atual) === false
      ) {
        visited.push(atual);

        const neighbors = this.conections.get(atual) ?? [];
        connecteds.push(...neighbors);
      }
    }

    return visited.sort();
  }
}
