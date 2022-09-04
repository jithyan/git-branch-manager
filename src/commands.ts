import { checkoutBranch, getBranchList } from "./git";
import { renderLoadingIndicator, renderSelect } from "./selectBranchUi";
import { highlight, error } from "./log";

interface Command {
  name: string;
  execute: (...args: string[]) => Promise<void>;
}

const switchCommand: Command = {
  name: "switch",
  execute: async (...args: string[]) => {
    const clearLoading = renderLoadingIndicator();

    const { branches, currentBranch } = await getBranchList().catch((e) => {
      clearLoading();
      error(e);
      process.exit(1);
    });
    const checkedOutbranches = branches.filter((branch) => branch.isCheckedOut);
    clearLoading();

    if (checkedOutbranches.length === 0) {
      highlight(
        "No branches checked out locally. To checkout a branch from remote use 'add' instead."
      );
      process.exit(0);
    }

    renderSelect({
      onBranchSelected: async (branch) => {
        return checkoutBranch(branch);
      },
      currentBranch,
      otherBranches: checkedOutbranches.map((b) => b.name),
    });
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
  },
};

const removeCommand: Command = {
  name: "remove",
  execute: async (...args: string[]) => {
    const { branches, currentBranch } = await getBranchList();
    const checkedOutbranches = branches.filter((branch) => branch.isCheckedOut);
  },
};

const commandList = [switchCommand, addCommand, removeCommand] as const;

export const commands = new Map(
  commandList.map((command) => [command.name, command])
);
