"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
const git_1 = require("./git");
const selectBranchUi_1 = require("./selectBranchUi");
const log_1 = require("./log");
async function renderLoadingUntilComplete(work) {
    const clearLoading = (0, selectBranchUi_1.renderLoadingIndicator)();
    try {
        const result = await work();
        clearLoading();
        return result;
    }
    catch (e) {
        clearLoading();
        (0, log_1.logError)(e);
        process.exit(1);
    }
}
const switchCommand = {
    name: "switch",
    execute: async (...args) => {
        const { branches, currentBranch } = await renderLoadingUntilComplete(git_1.getBranchList);
        const checkedOutbranches = branches.filter((branch) => branch.isCheckedOut);
        if (checkedOutbranches.length === 0) {
            (0, log_1.logHighlight)("No branches checked out locally.");
            (0, log_1.logHighlight)("To checkout a branch from remote use 'add' instead.");
            process.exit(0);
        }
        (0, selectBranchUi_1.renderSelect)({
            onBranchSelected: async (branch) => {
                return (0, git_1.checkoutBranch)(branch);
            },
            currentBranch,
            otherBranches: checkedOutbranches.map((b) => b.name),
        });
    },
};
const addCommand = {
    name: "add",
    execute: async (...args) => {
        const { branches, currentBranch } = await renderLoadingUntilComplete(() => (0, git_1.getBranchList)(true));
        const filteredRemoteBranches = branches.filter((branch) => !branch.isCheckedOut &&
            branch.name.toUpperCase().includes(args[0]?.toUpperCase() ?? ""));
        if (filteredRemoteBranches.length === 0) {
            (0, log_1.logHighlight)("No branches found in remote found to add.");
            process.exit(0);
        }
        (0, selectBranchUi_1.renderSelect)({
            onBranchSelected: (branch) => (0, git_1.checkoutBranch)(branch),
            currentBranch,
            otherBranches: filteredRemoteBranches.map((b) => b.name),
        });
    },
};
const removeCommand = {
    name: "remove",
    execute: async (...args) => {
        const { branches, currentBranch } = await renderLoadingUntilComplete(git_1.getBranchList);
        const checkedOutbranches = branches.filter((branch) => branch.isCheckedOut);
        if (checkedOutbranches.length === 0) {
            (0, log_1.logHighlight)("Nothing to remove - No branches checked out locally");
            process.exit(0);
        }
        (0, selectBranchUi_1.renderSelect)({
            onBranchSelected: async (branch) => (0, git_1.deleteLocalBranch)(branch),
            currentBranch,
            otherBranches: checkedOutbranches.map((b) => b.name),
        });
    },
};
const stashCommand = {
    name: "stash",
    execute: async (...args) => {
        const stashList = await renderLoadingUntilComplete(git_1.getStashList);
        if (stashList.length === 0) {
            (0, log_1.logHighlight)("Stash is empty");
            process.exit(0);
        }
        (0, selectBranchUi_1.renderSelect)({
            onBranchSelected: async (desc) => {
                const stashId = stashList.find((s) => s.description === desc)?.id ?? "";
                return (0, git_1.applyStash)(stashId);
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
];
exports.Commands = new Map(commandList.map((command) => [command.name, command]));
