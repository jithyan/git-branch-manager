import { exec } from "child_process";

async function execCommand(command: string) {
  return new Promise<string>((resolve, reject) =>
    exec(command, (error, stdout, stderr) =>
      error ? reject(stderr) : resolve(stdout)
    )
  );
}

interface Branch {
  name: string;
  isCheckedOut: boolean;
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
  ).map((branch) => ({
    name: branch,
    isCheckedOut: checkedOutbranches.has(branch),
  })) as Branch[];

  return {
    currentBranch,
    branches,
  };
}
