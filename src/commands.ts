import { getBranchList } from "./git";

interface Command {
  name: string;
  execute: (...args: string[]) => Promise<void>;
}

const switchCommand: Command = {
  name: "switch",
  execute: async (...args: string[]) => {
    const { branches, currentBranch } = await getBranchList();
    console.log(`Current branch: ${currentBranch}`);
    console.log("branches", branches);
  },
};

const commandList: Readonly<Command[]> = [switchCommand] as const;

export const commands = new Map(
  commandList.map((command) => [command.name, command])
);
