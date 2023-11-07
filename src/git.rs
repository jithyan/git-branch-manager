use crate::util::{parse_command, print_error_and_exit};
use console::style;
use std::process::Command;

fn parse_branches(output: &String, only_remote: bool) -> (Vec<String>, String) {
    let mut current_branch: Option<String> = None;
    let branches = output
        .split('\n')
        .map(|s| String::from(s.trim()))
        .filter(|s| {
            if s.contains("*") {
                current_branch = Some(String::from(s.replace("*", "").trim()));
                return false;
            } else {
                return !only_remote || only_remote && s.contains("remotes/origin/");
            }
        })
        .map(|s| s.replace("remotes/origin/", "").trim().to_string())
        .filter(|b| !b.is_empty())
        .collect();

    match current_branch {
        Some(branch) => (branches, branch),
        None => print_error_and_exit(String::from("Unexpected error: current branch not found")),
    }
}

pub fn get_local_branches() -> (Vec<String>, String) {
    match parse_command(Command::new("git").arg("branch")) {
        Ok(output) => parse_branches(&output, false),
        Err(error) => print_error_and_exit(error),
    }
}

pub fn get_remote_branches() -> Vec<String> {
    match parse_command(Command::new("git").arg("fetch")) {
        Ok(output) => println!("{}", style(output).cyan().bold()),
        Err(error) => print_error_and_exit(error),
    };
    match parse_command(Command::new("git").arg("branch").arg("--list").arg("--all")) {
        Ok(output) => parse_branches(&output, true).0,
        Err(error) => print_error_and_exit(error),
    }
}
