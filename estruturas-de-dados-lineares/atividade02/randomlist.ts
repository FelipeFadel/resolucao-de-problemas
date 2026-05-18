import LinkedList from "./linkedList";

export default class RandomList {
  private list: number[];

  public constructor(tam: number) {
    this.list = [];

    for (let i = 0; i < tam; i++) {
      const randomNumber = Math.floor(Math.random() * 100);
      this.list.push(randomNumber);
    }
  }

  public toString(): string {
    let str = "";

    for (let i = 0; i < this.list.length; i++) {
      str = str + this.list[i];

      if (i < this.list.length - 1) {
        str = str + ", ";
      }
    }

    return str;
  }

  public inverte() {
    //Ainda vou implementar
    // Reverter a lista interando até metade
  }

  public rangeDois(): number {
    const max = Math.max(...this.list); //Operador de Spread
    const min = Math.min(...this.list); //A ideia é que ele espalha os componentes da lista dentro da funcao, uma alternativa seria `Math.min.apply(list)`
    return max - min;
  }

  public range(): number {
    let menor = this.list[0];
    let maior = this.list[0];

    for (let i = 1; i < this.list.length; i++) {
      if (this.list[i] < menor) menor = this.list[i];
      if (this.list[i] > maior) maior = this.list[i];
    }

    return maior - menor;
  }

  public josephusSurvivor(n: number, k: number) {
    let circle: number[] = [];

    for (let i = 0; i < n; i++) {
      circle.push(i + 1);
    }

    let index = 0;
    while (circle.length > 1) {
      index = (index + k - 1) % circle.length;

      circle.splice(index, 1);

      console.log(circle);
    }

    return circle[0];
  }

  public josephusSurvivorNoMemory(n: number, k: number) {
    let index = 0;

    for (let i = 2; i < n; i++) {
      index = (index + k) % i;
    }

    console.log(index + 1);
    return index + 1;
  }

  public josephus() {
    const circle = new LinkedList<number>();

    for (let i = 0; i < this.list.length; i++) {
      circle.append(this.list[i]);
    }

    circle.makeCircular();

    while (circle.getSize() > 1) {
      circle.removeAt(Math.random() * 20);
      circle.print();
    }

    console.log(`Quem sobrou`);
    circle.print();
  }
}
