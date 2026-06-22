export default class LongestSubstring {
  private word: string;

  public constructor(word: string) {
    this.word = word;
  }

  public getLongest(): number {
    let inicio: number = 0;
    let subString: string = this.word[inicio];
    let visitados: string;
    while (inicio < this.word.length) {
      for (let i = inicio; i < this.word.length; i++) {
        if()
      }
    }
    return 0;
  }
}
