import { spawn } from "node:child_process";
import { warn } from "node:console";
import { error } from "./log";
import { highlight } from "./log";

async function execCommand(command: string) {
  return new Promise<string>((resolve, reject) => {
    const list = command.split(" ");
    const c = list[0];
    const args = list.splice(1);

    const ps = spawn(c, args);

    let output = "";
    let error = "";

    ps.stdout.on("data", (data) => {
      output += Buffer.from(data).toString("utf8");
    });

    ps.stderr.on("data", (err) => {
      error += Buffer.from(err).toString("utf8");
    });

    ps.on("exit", (code) => {
      output = output.trim();
      error = error.trim();

      if (code !== null && code > 0) {
        if (output) {
          warn(output);
        }
        reject(error);
      } else {
        if (error) {
          warn(error);
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
  branchName: string,
  isNewBranch = false
): Promise<boolean | string> {
  return execCommand(
    [
      "git",
      "checkout",
      isNewBranch ? `-b ${branchName}` : `${branchName}`,
    ].join(" ")
  )
    .then((output) => {
      highlight(output);
      return true;
    })
    .catch((e) => {
      error(e);
      return false;
    });
}

export async function deleteLocalBranch(
  branchName: string
): Promise<boolean | string> {
  return execCommand(`git branch -D ${branchName}`)
    .then((output) => {
      highlight(output);
      return true;
    })
    .catch((e) => {
      error(e);
      return false;
    });
}

export async function getBranchList(): Promise<{
  branches: Branch[];
  currentBranch: string;
}> {
  const output = await execCommand("git branch --list --all");

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
