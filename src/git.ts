import { spawn } from "child_process";
import { logError, logWarn } from "./log";
import { logHighlight } from "./log";

async function execCommand([command, ...opts]: string[]) {
  return new Promise<string>((resolve, reject) => {
    const commandProcess = spawn(command, opts);

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
          logWarn(output);
        }
        reject(errorOutput);
      } else {
        if (errorOutput) {
          logWarn(errorOutput);
        }
        resolve(output);
      }
    });
  });
}

interface Branch {
  name: string;
  isCheckedOut: boolean;
}

export async function checkoutBranch(
  branchName: string
): Promise<boolean | string> {
  return execCommand(["git", "checkout", branchName])
    .then((output) => {
      logHighlight(output);
      return true;
    })
    .catch((e) => {
      logError(e);
      return false;
    });
}

export async function deleteLocalBranch(
  branchName: string
): Promise<boolean | string> {
  return execCommand(["git", "branch", "-D", branchName])
    .then((output) => {
      logHighlight(output);
      return true;
    })
    .catch((e) => {
      logError(e);
      return false;
    });
}

export async function getBranchList(fetchFirst = false): Promise<{
  branches: Branch[];
  currentBranch: string;
}> {
  if (fetchFirst) {
    await execCommand(["git", "fetch"]);
  }
  const output = await execCommand(["git", "branch", "--list", "--all"]);

  let currentBranch = "";
  const checkedOutbranches = new Set<string>();

  const branches = Array.from(
    new Set(
      output
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
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
        })
    )
  )
    .filter(
      (branchName) =>
        branchName !== currentBranch && !branchName.startsWith("HEAD")
    )
    .map((branch) => ({
      name: branch,
      isCheckedOut: checkedOutbranches.has(branch),
    })) as Branch[];

  return {
    currentBranch,
    branches,
  };
}
