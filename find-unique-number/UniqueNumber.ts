export default class UniqueNumber {
  private arr: number[];

  public constructor(arr: number[]) {
    // Evitamos fazer uma cópia [...arr] para garantir a performance com arrays gigantes
    this.arr = arr;
  }

  public findUniq(): number {
    // Determinamos qual é o número comum verificando os 3 primeiros elementos
    // Já que é garantido ter pelo menos 3 números e apenas 1 diferente
    const common = 
      this.arr[0] === this.arr[1] ? this.arr[0] :
      this.arr[0] === this.arr[2] ? this.arr[0] : 
      this.arr[1];

    // Buscamos o primeiro que seja diferente do número comum
    for (let i = 0; i < this.arr.length; i++) {
      if (this.arr[i] !== common) {
        return this.arr[i];
      }
    }

    throw new Error("Número único não encontrado.");
  }
}
