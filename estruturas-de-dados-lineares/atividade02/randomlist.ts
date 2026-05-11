export default class RandomList {
    private list: number[];

    public constructor(tam: number) {
        this.list = [];

        for (let i = 0; i < tam; i++) {
            const randomNumber = Math.floor(Math.random() * 100);
            this.list.push(randomNumber);
        }
    }

    public toString(): string {
        let str = "";

        for (let i = 0; i < this.list.length; i++) {
            str = str + this.list[i];

            if (i < this.list.length - 1) {
                str = str + ", ";
            }
        }

        return str;
    }
}
