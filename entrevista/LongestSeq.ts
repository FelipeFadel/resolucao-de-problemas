export default class LongestSeq {
  private sequence: number[];

  public constructor(sequence: number[]) {
    this.sequence = sequence;
  }

  public getLongestLenght(): number {
    if (this.sequence.length === 0) return 0;

    let maxLength = 1;
    let currentLength = 1;

    for (let i = 1; i < this.sequence.length; i++) {
      if (this.sequence[i] > this.sequence[i - 1]) {
        currentLength++;
        if (currentLength > maxLength) maxLength = currentLength;
      } else {
        currentLength = 1;
      }
    }

    return maxLength;
  }

  public getLongest(): number[] {
    if (this.sequence.length === 0) return [];

    let bestSequence: number[] = [];
    let currentSequence: number[] = [this.sequence[0]];

    for (let i = 1; i < this.sequence.length; i++) {
      if (this.sequence[i] > this.sequence[i - 1]) {
        currentSequence.push(this.sequence[i]);
      } else {
        if (currentSequence.length > bestSequence.length) {
          bestSequence = currentSequence;
        }
        currentSequence = [this.sequence[i]];
      }
    }

    if (currentSequence.length > bestSequence.length) {
      bestSequence = currentSequence;
    }

    return bestSequence;
  }
}
