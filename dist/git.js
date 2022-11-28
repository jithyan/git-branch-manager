"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchList = exports.applyStash = exports.getStashList = exports.deleteLocalBranch = exports.checkoutBranch = void 0;
const child_process_1 = require("child_process");
const log_1 = require("./log");
function getTrimmedLines(output) {
    return output
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}
async function execCommand([command, ...opts]) {
    return new Promise((resolve, reject) => {
        const commandProcess = (0, child_process_1.spawn)(command, opts);
        let output = "";
        let errorOutput = "";
        commandProcess.stdout.on("data", (data) => {
            output += Buffer.from(data).toString("utf8");
        });
        commandProcess.stderr.on("data", (err) => {
            errorOutput += Buffer.from(err).toString("utf8");
        });
        commandProcess.on("exit", (code) => {
            output = output.trim();
            errorOutput = errorOutput.trim();
            const commandFailed = code !== null && code > 0;
            if (commandFailed) {
                if (output) {
                    (0, log_1.logWarn)(output);
                }
                reject(errorOutput);
            }
            else {
                if (errorOutput) {
                    (0, log_1.logWarn)(errorOutput);
                }
                resolve(output);
            }
        });
    });
}
async function checkoutBranch(branchName) {
    return execCommand(["git", "checkout", branchName])
        .then((output) => {
        (0, log_1.logHighlight)(output);
        return true;
    })
        .catch((e) => {
        (0, log_1.logError)(e);
        return false;
    });
}
exports.checkoutBranch = checkoutBranch;
async function deleteLocalBranch(branchName) {
    return execCommand(["git", "branch", "-D", branchName])
        .then((output) => {
        (0, log_1.logHighlight)(output);
        return true;
    })
        .catch((e) => {
        (0, log_1.logError)(e);
        return false;
    });
}
exports.deleteLocalBranch = deleteLocalBranch;
async function getStashList() {
    const output = await execCommand(["git", "stash", "list"]);
    return getTrimmedLines(output).map((line) => {
        const details = line.split(":").map((part) => part.trim());
        return {
            id: details[0],
            description: details.splice(1).join(":"),
        };
    });
}
exports.getStashList = getStashList;
async function applyStash(stashId) {
    return execCommand(["git", "stash", "apply", stashId])
        .then((output) => {
        (0, log_1.logHighlight)(output);
        return true;
    })
        .catch((e) => {
        (0, log_1.logError)(e);
        return false;
    });
}
exports.applyStash = applyStash;
async function getBranchList(fetchFirst = false) {
    if (fetchFirst) {
        await execCommand(["git", "fetch"]);
    }
    const output = await execCommand(["git", "branch", "--list", "--all"]);
    let currentBranch = "";
    const checkedOutbranches = new Set();
    const branches = Array.from(new Set(getTrimmedLines(output).map((line) => {
        const cleanedLine = line
            .replace("*", "")
            .trim()
            .replace("remotes/origin/", "")
            .trim();
        if (line.startsWith("*")) {
            currentBranch = cleanedLine;
        }
        if (!line.startsWith("remotes/")) {
            checkedOutbranches.add(cleanedLine);
        }
        return cleanedLine;
    })))
        .filter((branchName) => branchName !== currentBranch && !branchName.startsWith("HEAD"))
        .map((branch) => ({
        name: branch,
        isCheckedOut: checkedOutbranches.has(branch),
    }));
    return {
        currentBranch,
        branches,
    };
}
exports.getBranchList = getBranchList;
