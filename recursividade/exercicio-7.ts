class Potencia {
  public potenciaRecursiva(base: number, expoente: number): number {
    if (expoente === 0) {
      return 1;
    }
    return base * this.potenciaRecursiva(base, expoente - 1);
  }
}

const potencia = new Potencia();
console.log(potencia.potenciaRecursiva(2, 3)); // 8
console.log(potencia.potenciaRecursiva(5, 0)); // 1
console.log(potencia.potenciaRecursiva(3, 4)); // 81
