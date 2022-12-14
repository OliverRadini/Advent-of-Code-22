import { readFileSync } from "fs";


const fileloc = process.argv[2];
const isLogging = process.argv[3] === "true";
const roundCount = Number(process.argv[4]);


let input = readFileSync(fileloc, "utf8");

// by add \s*, it works

// str.replace(/([\d\.]+(,\s*[\d\.]+)+)/g, "[$1]");

const parseOperation = (operation: string) => {
  const fstring = operation
    .replace("new ", "")
    .replace("=", "return")
    .replace(/old/g, "x");
    // .replace(/(\d+)/g, "number($1)")
  const f = new Function("x", fstring);
 
  return (x: number) => Number(f(x));
}

const monkeyLinesToMonkey = (lines: Array<string>) => {
  const id = Number(lines[0].replace("Monkey ", "").replace(":", ""));
  const items = lines[1].replace("Starting items: ", "").split(", ").map(Number);
  const operation = parseOperation(lines[2].replace("Operation: ", ""));
  const test = (x: number) => x % (Number(lines[3].replace("Test: divisible by ", ""))) === Number(0);
  const trueTarget = Number(lines[4].replace("If true: throw to monkey ", ""));
  const falseTarget = Number(lines[5].replace("If false: throw to monkey ", ""));
  const modularModulo = Number(lines[3].replace("Test: divisible by ", ""));
 
  return new Monkey(id, items, operation, test, trueTarget, falseTarget, modularModulo, isLogging);
};
 
 
class Monkey {
  private inspectionCount = 0;
  constructor (
    private id: number,
    private items: Array<number>,
    private operation: (item: number) => number,
    private test: (item: number) => boolean,
    private trueTarget: number,
    private falseTarget: number,
    private modularModulo: number,
    private loggingEnabled: boolean
  ) {
    this.inspectItems = this.inspectItems.bind(this);
    this.receiveItem = this.receiveItem.bind(this);
    this.getInspectionCount = this.getInspectionCount.bind(this);
    this.getModularModulo = this.getModularModulo.bind(this);
  }
 
  public hasId (id: number) {
    return this.id === id;
  }

  public getModularModulo() {
    return this.modularModulo;
  }
 
  public receiveItem(item: number) {
    this.items.push(item % this.modularModulo);
  }
 
  public inspectItems(callback: (item: number, monkeyTargetId: number) => void) {
    this.log(`Monkey ${this.id}:`);
 
    for (let item of this.items) {
        this.inspectionCount++;
      this.log(`  Monkey inspects an item with a worry level of ${item}.`)
 
      let worryLevel = this.operation(item)
      this.log(`    Worry level is multiplied to ${worryLevel}.`);
 
    //   worryLevel = this.adjustWorryLevelForBoredom(worryLevel);
    //   this.log(`    Monkey gets bored with item. Worry level is divided by 3 to ${worryLevel}.`)
 
      const target = this.test(worryLevel) ? this.trueTarget : this.falseTarget;
 
      this.log(`    Item with worry level ${worryLevel} is thrown to monkey ${target}.`);
 
      callback(worryLevel, target);
      this.removeItem(item);
    }
  }
 
  public report() {
    this.log(`Monkey ${this.id} has items [${this.items.join(", ")}]`);
  }

  public getInspectionCount() {
    return this.inspectionCount;
  }

  public setModularmodulo (modulo: number) {
    this.modularModulo = modulo;
  }
 
  private log(s: string) {
    if (this.loggingEnabled) {
      console.log(s);
    }
  }
 
  private adjustWorryLevelForBoredom(worryLevel: number) {
    return Math.floor(worryLevel / 3);
  }
 
  private removeItem(item: number) {
    this.items = this.items.filter(x => x !== item);
  }
}
 
class MonkeyGame {
  constructor(private monkeys: Array<Monkey>) {
    this.nextRound = this.nextRound.bind(this);
  }
 
  public nextRound() {
    for (let monkey of this.monkeys) {
      monkey.inspectItems(this.giveMonkeyItem.bind(this));
      monkey.report();
    }
  }

  public calculateMonkeyBusiness () {
    return this.monkeys
        .map(monkey => monkey.getInspectionCount())
        .sort((a, b) => a > b ? -1 : 1)
        .slice(0, 2)
        .reduce(
            (p, c) => p * c, 1
        );
  }
 
  private giveMonkeyItem (item: number, monkeyTargetId: number) {
    const monkeyMatch = this.monkeys.find(m => m.hasId(monkeyTargetId));
 
    if (monkeyMatch === undefined) {
      console.error(`Could not find a monkey with id ${monkeyTargetId}`)
      return;
    }
 
    monkeyMatch.receiveItem(item);
  }
}
 
const monkeys = input.split("Monkey ")
    .map(x => x.split("\n"))
    .filter(x => x.length > 1)
    .map(monkeyLinesToMonkey);

const modularModulo = monkeys
    .map(monkey => monkey.getModularModulo())
    .reduce((p, c) => p * c, 1);

console.log(modularModulo);

monkeys.forEach(m => m.setModularmodulo(modularModulo));
 
const game = new MonkeyGame(monkeys);
 
for (let i = 0; i < roundCount; i++) {
    console.log(`${(i / roundCount) * 100}%`)
    game.nextRound();
}

monkeys.forEach(monkey => console.log(monkey.getInspectionCount()));

console.log(game.calculateMonkeyBusiness());