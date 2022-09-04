import minimist from "minimist";
import { commands } from "./commands";
import { error } from "./console";

const argv = minimist(process.argv.slice(2));

run(...argv._);

function run(...args: string[]) {
  const command = commands.get(args[0]);

  if (!command) {
    error("Unrecognized command: ", args[0]);
    process.exit(1);
  }
  command.execute(...args.slice(1));
}
