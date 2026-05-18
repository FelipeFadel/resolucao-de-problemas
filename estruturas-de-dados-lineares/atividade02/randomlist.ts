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

  // ex3 remove todos os elementos menores que n
  public valorDeCorte(n: number): void {
    let i = 0;
    while (i < this.list.length) {
      if (this.list[i] < n) {
        // desloca todos os elementos seguintes uma posicao para a esquerda
        for (let j = i; j < this.list.length - 1; j++) {
          this.list[j] = this.list[j + 1];
        }
        this.list.length--;
      } else {
        i++;
      }
    }
  }

  // ex4 remove os elementos cujas posicoes (1-indexadas) sao multiplas de n
  public removeMultiplos(n: number): void {
    if (n === 0) return;

    let i = 0;
    // posicao 1-indexada do elemento atual apos remocoes
    let posicao = 1;

    while (i < this.list.length) {
      if (posicao % n === 0) {
        for (let j = i; j < this.list.length - 1; j++) {
          this.list[j] = this.list[j + 1];
        }
        this.list.length--;
        // nao incrementa i pois o proximo elemento desceu para a posicao atual
        // mas a posicao logica avanca normalmente
      } else {
        i++;
      }
      posicao++;
    }
  }

  // ex5 retorna o elemento mais proximo da media, em caso de empate retorna o primeiro
  public maisPróximoDaMedia(): number {
    let soma = 0;
    for (let i = 0; i < this.list.length; i++) {
      soma = soma + this.list[i];
    }

    const media = soma / this.list.length;

    let maisProximo = this.list[0];
    let menorDiferenca = Math.abs(this.list[0] - media);

    for (let i = 1; i < this.list.length; i++) {
      const diferenca = Math.abs(this.list[i] - media);
      if (diferenca < menorDiferenca) {
        menorDiferenca = diferenca;
        maisProximo = this.list[i];
      }
    }

    return maisProximo;
  }

  // ex6 reduz a lista aos primeiros n elementos
  public reduz(n: number): void {
    if (n >= this.list.length) return;
    this.list.length = n;
  }

  // ex7 fatia a lista de inicio ate fim (sem usar slice)
  public fatia(inicio: number, fim: number): void {
    const novaLista: number[] = [];

    for (let i = inicio; i <= fim && i < this.list.length; i++) {
      novaLista.push(this.list[i]);
    }

    this.list.length = 0;
    for (let i = 0; i < novaLista.length; i++) {
      this.list.push(novaLista[i]);
    }
  }

  // ex8 inverte a lista trocando elementos simetricos ate chegar no meio (sem usar reverse)
  public inverte(): void {
    let inicio = 0;
    let fim = this.list.length - 1;

    while (inicio < fim) {
      const temp = this.list[inicio];
      this.list[inicio] = this.list[fim];
      this.list[fim] = temp;

      inicio++;
      fim--;
    }
  }

  // ex9 retorna a diferenca entre o maior e o menor elemento
  public range(): number {
    let menor = this.list[0];
    let maior = this.list[0];

    for (let i = 1; i < this.list.length; i++) {
      if (this.list[i] < menor) menor = this.list[i];
      if (this.list[i] > maior) maior = this.list[i];
    }

    return maior - menor;
  }

  public rangeDois(): number {
    const max = Math.max(...this.list);
    const min = Math.min(...this.list);
    return max - min;
  }

  // ex10 variacao do josephus: cada pessoa tem seu proprio numero escolhido (this.list)
  // sorteia-se uma pessoa inicial, usa-se o numero dela para contar a partir da proxima
  // a pessoa eliminada passa seu numero para a proxima contagem
  public josephusVariacao(): number {
    // pessoas[i] = { id: i+1 (numero da pessoa), numero: numero que ela escolheu }
    const pessoas: { id: number; numero: number }[] = [];
    for (let i = 0; i < this.list.length; i++) {
      // garante que o numero escolhido seja positivo (minimo 1)
      const numero = this.list[i] > 0 ? this.list[i] : 1;
      pessoas.push({ id: i + 1, numero: numero });
    }

    // sorteia uma pessoa inicial aleatoriamente
    let inicioIndex = Math.floor(Math.random() * pessoas.length);
    console.log(`Pessoa inicial sorteada: ${pessoas[inicioIndex].id} (numero ${pessoas[inicioIndex].numero})`);

    let contagemAtual = pessoas[inicioIndex].numero;
    let currentIndex = inicioIndex;

    while (pessoas.length > 1) {
      // conta contagemAtual pessoas a partir da proxima em sentido horario
      currentIndex = (currentIndex + contagemAtual) % pessoas.length;

      const eliminada = pessoas[currentIndex];
      console.log(`Eliminada: pessoa ${eliminada.id} (numero ${eliminada.numero})`);

      contagemAtual = eliminada.numero;

      // remove a pessoa eliminada deslocando o array manualmente
      for (let j = currentIndex; j < pessoas.length - 1; j++) {
        pessoas[j] = pessoas[j + 1];
      }
      pessoas.length--;

      // ajusta o indice pois o proximo elemento desceu para a posicao atual
      if (currentIndex >= pessoas.length) {
        currentIndex = 0;
      }
    }

    console.log(`Sobrevivente: pessoa ${pessoas[0].id}`);
    return pessoas[0].id;
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
