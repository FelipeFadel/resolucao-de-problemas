import { Stack } from '../stack';

export class Balanceamento {
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  isBalanced(): boolean {
    const stack = new Stack<string>();

    const hierarchy: { [key: string]: number } = {
      '{': 1,
      '[': 2,
      '(': 3
    };

    const matchingPairs: { [key: string]: string } = {
      '}': '{',
      ']': '[',
      ')': '('
    };

    for (const char of this.text) {
      if (hierarchy[char]) {
        const currentTop = stack.peek();

        if (currentTop) {
          const topLevel = hierarchy[currentTop];
          const newLevel = hierarchy[char];

          if (newLevel < topLevel) {
            return false;
          }
        }

        stack.push(char);
      }
      else if (matchingPairs[char]) {
        const expectedOpener = matchingPairs[char];
        const actualOpener = stack.pop();

        if (actualOpener !== expectedOpener) {
          return false;
        }
      }
    }

    return stack.isEmpty();
  }
}
