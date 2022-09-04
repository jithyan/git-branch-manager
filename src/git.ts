import { ChildProcess, exec } from "node:child_process";
import { error } from "./log";
import { highlight } from "./log";

async function execCommand(command: string) {
  let p: ChildProcess;
  return new Promise<string>(
    (resolve, reject) =>
      (p = exec(command, (error, stdout, stderr) =>
        error ? reject(stderr) : resolve(stdout)
      ))
  ).finally(() => {
    p?.kill();
  });
}

interface Branch {
  name: string;
  isCheckedOut: boolean;
}

export async function checkoutBranch(
  branchName: string
): Promise<boolean | string> {
  return execCommand(`git checkout ${branchName}`)
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
