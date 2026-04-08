//Felipe Fadel e Natalia Lupp

class ConjuntoInteiro {
  conjunto: number[];
  divisors: number[];

  constructor(conjunto: number[]) {
    this.conjunto = conjunto;
    this.divisors = [];
  }

  divisores(index: number): void {
    for (let i = 2; i <= this.conjunto[index]; i++) {
      if (i % this.conjunto[index] === 0) {
        this.divisors.push(index);
      }
    }
  }

  saocoprimos(): boolean {
    for (let j = 0; j < this.conjunto.length; j++) {
      this.divisores(j);
    }

    for (let j = 0; j < this.divisors.length; j++) {
      let restouZero: boolean = true;
      for (let i = 0; i < this.conjunto.length; i++) {
        if (this.divisors[j] % this.conjunto[i] === 0) restouZero = true;
        else restouZero = false;
      }
      if (restouZero) return false;
    }
    return false;
  }
}

const testeA = new ConjuntoInteiro([8, 15]);
console.log("Teste 1");
console.log(testeA.saocoprimos());

const testeB = new ConjuntoInteiro([11, 143]);
console.log("Teste 2");
console.log(testeB.saocoprimos());

const testeC = new ConjuntoInteiro([2, 3, 5, 6, 7, 8]);
console.log("Teste 3");
console.log(testeC.saocoprimos());

const testeD = new ConjuntoInteiro([15, 99, 36, 27]);
console.log("Teste 4");
console.log(testeD.saocoprimos());

const testeE = new ConjuntoInteiro([10, 8, 6, 4]);
console.log("Teste 5");
console.log(testeE.saocoprimos());

const testeF = new ConjuntoInteiro([197, 173, 157, 109, 101]);
console.log("Teste 6");
console.log(testeF.saocoprimos());

const testeG = new ConjuntoInteiro([17, 907, 911]);
console.log("Teste 7");
console.log(testeG.saocoprimos());
