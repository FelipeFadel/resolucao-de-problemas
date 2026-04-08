export class Palindromo {
  private word: string;

  public constructor(word: string) {
    this.word = word;
  }

  public isPalindrome(i: number = 0): boolean {
    if (i === Math.floor(this.word.length / 2)) return true;
    if (this.word[i] !== this.word[this.word.length - i - 1]) return false;
    return this.isPalindrome(i + 1);
  }
}
