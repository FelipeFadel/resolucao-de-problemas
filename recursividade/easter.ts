// Felipe Fadel
// Natalia Lupp

class Easter {
  private sceneText: string; //Nosso cenario com os possiveis ovos

  constructor(scene: string) {
    this.sceneText = scene;
  }

  public findEasterEggs(): number {
    return this.search(this.sceneText);
  }

  private search(text: string): number {
    for (let i = 0; i < text.length - 1; i++) {
      //Fazemos recursivamente o for com o novo texto porque podem se formar novos ovos conforme vamos iterando e removendo os ovos
      if (text[i] === "(" && text[i + 1] === ")") {
        let novoText =
          text.substring(0, i) + text.substring(i + 2, text.length);

        return 1 + this.search(novoText);
      }
    }

    //Se pasar o for inteiro e e não retornar quer dizer que não achamos nada
    return 0;
  }
}

let teste1 = new Easter("()");
console.log(teste1.findEasterEggs()); //1

let teste2 = new Easter("()()");
console.log(teste2.findEasterEggs()); //2

let teste3 = new Easter("(())");
console.log(teste3.findEasterEggs()); //2

let teste4 = new Easter("((()))");
console.log(teste4.findEasterEggs()); //3

let teste5 = new Easter(")(");
console.log(teste5.findEasterEggs()); //0

let teste6 = new Easter("()(()())");
console.log(teste6.findEasterEggs()); //4
