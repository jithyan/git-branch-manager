import { checkoutBranch, deleteLocalBranch, getBranchList } from "./git";
import { renderLoadingIndicator, renderSelect } from "./selectBranchUi";
import { highlight, error } from "./log";

interface Command {
  name: string;
  execute: (...args: string[]) => Promise<void>;
}

function handleErrorAndExit(clearLoading: () => void) {
  return (e: any) => {
    clearLoading();
    error(e);
    process.exit(1);
  };
}

const switchCommand: Command = {
  name: "switch",
  execute: async (...args: string[]) => {
    const clearLoading = renderLoadingIndicator();

    const { branches, currentBranch } = await getBranchList().catch(
      handleErrorAndExit(clearLoading)
    );
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
    const clearLoading = renderLoadingIndicator();

    const { branches, currentBranch } = await getBranchList().catch(
      handleErrorAndExit(clearLoading)
    );
    const filteredRemoteBranches = branches.filter(
      (branch) =>
        !branch.isCheckedOut &&
        branch.name.toUpperCase().includes(args[0].toUpperCase() ?? "")
    );
    clearLoading();

    if (filteredRemoteBranches.length === 0) {
      highlight("No branches found in remote found to add.");
      process.exit(0);
    }

    renderSelect({
      onBranchSelected: async (branch) => {
        return checkoutBranch(branch);
      },
      currentBranch,
      otherBranches: filteredRemoteBranches.map((b) => b.name),
    });
  },
};

const removeCommand: Command = {
  name: "remove",
  execute: async (...args: string[]) => {
    const clearLoading = renderLoadingIndicator();

    const { branches, currentBranch } = await getBranchList().catch(
      handleErrorAndExit(clearLoading)
    );
    const checkedOutbranches = branches.filter((branch) => branch.isCheckedOut);
    clearLoading();

    if (checkedOutbranches.length === 0) {
      highlight("Nothing to remove - No branches checked out locally");
      process.exit(0);
    }

    renderSelect({
      onBranchSelected: async (branch) => {
        return deleteLocalBranch(branch);
      },
      currentBranch,
      otherBranches: checkedOutbranches.map((b) => b.name),
    });
  },
};

const commandList = [switchCommand, addCommand, removeCommand] as const;

export const commands = new Map(
  commandList.map((command) => [command.name, command])
);
