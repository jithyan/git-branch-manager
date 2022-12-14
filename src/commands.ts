import {
  applyStash,
  checkoutBranch,
  deleteLocalBranch,
  getBranchList,
  getStashList,
} from "./git";
import { renderLoadingIndicator, renderSelect } from "./selectBranchUi";
import { logHighlight, logError } from "./log";

interface Command {
  name: string;
  execute: (...args: string[]) => Promise<void>;
}

async function renderLoadingUntilComplete<R = any>(
  work: () => Promise<R>
): Promise<R> {
  const clearLoading = renderLoadingIndicator();
  try {
    const result = await work();
    clearLoading();
    return result;
  } catch (e: any) {
    clearLoading();
    logError(e);
    process.exit(1);
  }
}

const switchCommand: Command = {
  name: "switch",
  execute: async (...args: string[]) => {
    const { branches, currentBranch } = await renderLoadingUntilComplete(
      getBranchList
    );
    const checkedOutbranches = branches.filter((branch) => branch.isCheckedOut);

    if (checkedOutbranches.length === 0) {
      logHighlight("No branches checked out locally.");
      logHighlight("To checkout a branch from remote use 'add' instead.");
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
    const { branches, currentBranch } = await renderLoadingUntilComplete(() =>
      getBranchList(true)
    );
    const filteredRemoteBranches = branches.filter(
      (branch) =>
        !branch.isCheckedOut &&
        branch.name.toUpperCase().includes(args[0]?.toUpperCase() ?? "")
    );

    if (filteredRemoteBranches.length === 0) {
      logHighlight("No branches found in remote found to add.");
      process.exit(0);
    }

    renderSelect({
      onBranchSelected: (branch) => checkoutBranch(branch),
      currentBranch,
      otherBranches: filteredRemoteBranches.map((b) => b.name),
    });
  },
};

const removeCommand: Command = {
  name: "remove",
  execute: async (...args: string[]) => {
    const { branches, currentBranch } = await renderLoadingUntilComplete(
      getBranchList
    );
    const checkedOutbranches = branches.filter((branch) => branch.isCheckedOut);

    if (checkedOutbranches.length === 0) {
      logHighlight("Nothing to remove - No branches checked out locally");
      process.exit(0);
    }

    renderSelect({
      onBranchSelected: async (branch) => deleteLocalBranch(branch),
      currentBranch,
      otherBranches: checkedOutbranches.map((b) => b.name),
    });
  },
};

const stashCommand: Command = {
  name: "stash",
  execute: async (...args: string[]) => {
    const stashList = await renderLoadingUntilComplete(getStashList);
    if (stashList.length === 0) {
      logHighlight("Stash is empty");
      process.exit(0);
    }

    renderSelect({
      onBranchSelected: async (desc) => {
        const stashId = stashList.find((s) => s.description === desc)?.id ?? "";
        return applyStash(stashId);
      },
      otherBranches: stashList.map((b) => b.description),
    });
  },
};

const commandList = [
  switchCommand,
  addCommand,
  removeCommand,
  stashCommand,
] as const satisfies Readonly<Command[]>;

export const Commands = new Map(
  commandList.map((command) => [command.name, command])
);
