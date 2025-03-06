import chalk from "chalk";

export function sayHello(name: string = "world"): void {
  console.log(chalk.green(`Hello, ${name}!`));
}

export function listItems(items: string[]): void {
  console.log(chalk.yellow("Items:"));
  items.forEach((item, index) => {
    console.log(chalk.cyan(`  ${index + 1}. ${item}`));
  });
}
