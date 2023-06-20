import chalk from "chalk";
export function logError(msg, ...logs) {
    console.error(chalk.red(msg), ...logs);
}
export function logHighlight(msg, ...logs) {
    console.log(chalk.cyan(msg), ...logs);
}
export function logWarn(msg, ...logs) {
    console.log(chalk.yellow(msg), ...logs);
}
