import chalk from "chalk";

export function logError(msg: string, ...logs: any[]) {
  console.error(chalk.red(msg), ...logs);
}

export function logHighlight(msg: string, ...logs: any[]) {
  console.log(chalk.cyan(msg), ...logs);
}

export function logWarn(msg: string, ...logs: any[]) {
  console.log(chalk.yellow(msg), ...logs);
}
