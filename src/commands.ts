import { getBranchList } from "./git";

interface Command {
  name: string;
  execute: (...args: string[]) => Promise<void>;
}

const switchCommand: Command = {
  name: "switch",
  execute: async (...args: string[]) => {
    const { branches, currentBranch } = await getBranchList();
    const checkedOutbranches = branches.filter((branch) => branch.isCheckedOut);

    console.log(`Current branch: ${currentBranch}`);
    console.log("checkedOutbranches", checkedOutbranches);
  },
};

const addCommand: Command = {
  name: "add",
  execute: async (...args: string[]) => {
    const { branches, currentBranch } = await getBranchList();
    const filteredRemoteBranches = branches.filter(
      (branch) =>
        !branch.isCheckedOut &&
        branch.name.toUpperCase().includes(args[0] ?? "")
    );

    console.log(`Current branch: ${currentBranch}`);
    console.log("filteredRemoteBranches", filteredRemoteBranches);
  },
};

const removeCommand: Command = {
  name: "remove",
  execute: async (...args: string[]) => {
    const { branches, currentBranch } = await getBranchList();
    const checkedOutbranches = branches.filter((branch) => branch.isCheckedOut);

    console.log(`Current branch: ${currentBranch}`);
    console.log("checkedOutbranches", checkedOutbranches);
  },
};

const commandList = [switchCommand, addCommand, removeCommand] as const;

export const commands = new Map(
  commandList.map((command) => [command.name, command])
);
