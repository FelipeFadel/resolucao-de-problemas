//Alunos: Felipe Fadel && Natalia Lupp

class Clock {
  a: number;
  b: number;
  c: number;
  d: number;

  constructor(a: number, b: number, c: number, d: number) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  everyPermutation(): number[] {
    const numeros: number[] = [this.a, this.b, this.c, this.d];
    const resultados: number[] = [];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          for (let l = 0; l < 4; l++) {
            if (i != j && i != k && i != l && j != k && j != l && k != l) {
              const valor =
                numeros[i] * 1000 +
                numeros[j] * 100 +
                numeros[k] * 10 +
                numeros[l];

              resultados.push(valor);
            }
          }
        }
      }
    }

    return resultados;
  }

  bestPermutation(hours: number[]): number {
    let resposta: number = -1;
    for (let i = 0; i < hours.length; i++) {
      if (hours[i] > resposta && hours[i] <= 2400 && hours[i] % 100 <= 60)
        resposta = hours[i];
    }
    return resposta;
  }

  closestToMidnight(): string {
    const hours: number[] = this.everyPermutation();

    const bestHour: number = this.bestPermutation(hours);

    const hour: string = Math.round(bestHour / 100).toString();
    const minutes: string = Math.round(bestHour % 100).toString();

    return hour + ":" + minutes;
  }
}

// Testes
const clockA = new Clock(8, 9, 5, 1);
console.log(clockA.closestToMidnight());

const clockB = new Clock(0, 0, 0, 2);
console.log(clockB.closestToMidnight());

const clockC = new Clock(2, 1, 6, 6);
console.log(clockC.closestToMidnight());

const clockD = new Clock(1, 9, 5, 2);
console.log(clockD.closestToMidnight());
