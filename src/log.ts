import chalk from "chalk";

export function error(msg: string, ...logs: any[]) {
  console.error(chalk.red(msg), ...logs);
}

export function highlight(msg: string, ...logs: any[]) {
  console.log(chalk.cyan(msg), ...logs);
}

export function warn(msg: string, ...logs: any[]) {
  console.log(chalk.yellow(msg), ...logs);
}