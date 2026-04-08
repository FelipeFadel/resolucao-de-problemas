class RiceChess {
  public squaresNeeded(grains: number): number {
    if (grains === 0) return 0;
    return this.calculate(grains, 0, 0);
  }

  private calculate(grains: number, square: number, total: number): number {
    if (total >= grains) {
      return square;
    }

    const grainsInSquare = 1 << square;

    return this.calculate(grains, square + 1, total + grainsInSquare);
  }
}

const rice = new RiceChess();

console.log(rice.squaresNeeded(0)); // 0
console.log(rice.squaresNeeded(1)); // 1
console.log(rice.squaresNeeded(2)); // 2
console.log(rice.squaresNeeded(3)); // 2
console.log(rice.squaresNeeded(4)); // 3
