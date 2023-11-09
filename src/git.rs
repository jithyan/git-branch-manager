use crate::util::{parse_command, print_error_and_exit};
use console::style;
use std::process::Command;

fn parse_local_branches(output: &String) -> (Vec<String>, String) {
    let mut current_branch: Option<String> = None;
    let branches = output
        .split('\n')
        .map(|s| String::from(s.trim()))
        .filter(|s| {
            if s.contains("*") {
                current_branch = Some(String::from(s.replace("*", "").trim()));
                return false;
            }
            return !s.is_empty();
        })
        .collect();

    match current_branch {
        Some(branch) => (branches, branch),
        None => print_error_and_exit(String::from("Unexpected error: current branch not found")),
    }
}

pub fn get_local_branches() -> (Vec<String>, String) {
    match parse_command(Command::new("git").arg("branch")) {
        Ok(output) => parse_local_branches(&output),
        Err(error) => print_error_and_exit(error),
    }
}

fn parse_remote_branches(output: &String) -> (Vec<String>, String) {
    let mut current_branch: Option<String> = None;

    let branches: Vec<String> = output
        .split('\n')
        .map(|s| String::from(s.trim()))
        .filter(|s| !s.is_empty())
        .collect();
    let local_branches: Vec<String> = branches
        .iter()
        .filter(|s| !s.contains("remotes/origin/"))
        .map(|s| s.replace("* ", "").trim().to_string())
        .collect();

    let remote_branches: Vec<String> = branches
        .iter()
        .filter(|s| {
            if s.contains("*") {
                current_branch = Some(String::from(s.replace("*", "").trim()));
                return false;
            } else {
                return !s.contains("/HEAD");
            }
        })
        .map(|s| s.replace("remotes/origin/", "").trim().to_string())
        .filter(|b| !b.is_empty() && !local_branches.contains(&b))
        .collect();

    match current_branch {
        Some(branch) => (remote_branches, branch),
        None => print_error_and_exit(String::from("Unexpected error: current branch not found")),
    }
}

pub fn get_remote_branches() -> (Vec<String>, String) {
    match parse_command(Command::new("git").arg("fetch")) {
        Ok(output) => println!("{}", style(output).cyan().bold()),
        Err(error) => print_error_and_exit(error),
    };
    match parse_command(Command::new("git").arg("branch").arg("--list").arg("--all")) {
        Ok(output) => parse_remote_branches(&output),
        Err(error) => print_error_and_exit(error),
    }
}

pub fn stash_current_changes() -> Result<String, String> {
    parse_command(Command::new("git").arg("stash"))
}

pub fn stash_pop() -> Result<String, String> {
    parse_command(Command::new("git").arg("stash").arg("pop"))
}

pub fn create_new_branch(branch_name: &String) -> Result<String, String> {
    parse_command(
        Command::new("git")
            .arg("checkout")
            .arg("-b")
            .arg(branch_name),
    )
}

pub fn switch_to_branch(branch_name: &String) -> Result<String, String> {
    parse_command(Command::new("git").arg("checkout").arg(branch_name))
}

pub fn add_and_commit_changes(commit_message: &str) -> Result<String, String> {
    parse_command(
        Command::new("git")
            .arg("commit")
            .arg("-am")
            .arg(commit_message)
            .arg("--no-verify"),
    )
}

pub fn remove_branch(branch_name: &String) -> Result<String, String> {
    parse_command(Command::new("git").arg("branch").arg("-D").arg(branch_name))
}

pub fn rebase_from_branch(branch_name: &String) -> Result<String, String> {
    parse_command(
        Command::new("git")
            .arg("pull")
            .arg("origin")
            .arg(branch_name)
            .arg("-r"),
    )
}

pub fn add_all() -> Result<String, String> {
    parse_command(Command::new("git").arg("add").arg("."))
}

pub fn pull_fast_forward_only() -> Result<String, String> {
    parse_command(Command::new("git").arg("pull").arg("--ff-only"))
}
