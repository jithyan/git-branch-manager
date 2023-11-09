#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

mod cli;
mod git;
mod util;
use clap::{arg, Command};
use console::style;
use emoji_printer::print_emojis;
use git::{
    add_all, add_and_commit_changes, create_new_branch, get_remote_branches,
    pull_fast_forward_only, rebase_from_branch, remove_branch, stash_current_changes, stash_pop,
    switch_to_branch,
};
use once_cell::sync::Lazy;
use util::{print_error_and_exit, spinner};

pub struct GlobalData {
    check_emoji: String,
    cross_emoji: String,
    arrow_emoji: String,
}

static GLOBAL_DATA: Lazy<GlobalData> = Lazy::new(|| GlobalData {
    check_emoji: style(print_emojis(":check_mark: "))
        .bright()
        .green()
        .bold()
        .to_string(),
    cross_emoji: style(print_emojis(":cross_mark: "))
        .bright()
        .red()
        .bold()
        .to_string(),
    arrow_emoji: style(print_emojis(":right_arrow: "))
        .green()
        .bold()
        .to_string(),
});

fn print_success_output(output: String) {
    println!("\n{}", style(output).bright().cyan());
}

#[napi]
pub fn cli(itr: Vec<String>) {
    match init().get_matches_from(itr).subcommand() {
        Some(("switch", _)) => {
            let (branches, current_branch): (Vec<String>, String) = git::get_local_branches();

            println!(
                "{} {}{}",
                style("currently on").dim(),
                GLOBAL_DATA.arrow_emoji,
                style(current_branch).bright().cyan().bold()
            );

            let selected_branch = cli::select(branches, "select a branch to switch to");

            match switch_to_branch(&selected_branch) {
                Ok(output) => print_success_output(output),
                Err(error) => print_error_and_exit(error.to_string()),
            }
        }
        Some(("remove", _)) => {
            let (branches, _): (Vec<String>, String) = git::get_local_branches();
            let selected_branch = cli::select(branches, "select a branch to remove");

            match remove_branch(&selected_branch) {
                Ok(output) => print_success_output(output),
                Err(error) => print_error_and_exit(error.to_string()),
            }
        }
        Some(("ct", sub_matches)) => {
            let branch_name = sub_matches
                .get_one::<String>("BRANCH_NAME")
                .expect("required");

            let mut sp = spinner("Stashing all changes ...".into());
            match add_all() {
                Ok(_) => {}
                Err(error) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.cross_emoji);
                    print_error_and_exit(error.to_string())
                }
            };
            match stash_current_changes() {
                Ok(output) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.check_emoji);
                    println!("{}", style(output).dim());
                }
                Err(error) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.cross_emoji);
                    print_error_and_exit(error.to_string());
                }
            };

            let mut sp = spinner(format!("Moving changes to branch \"{}\"...", branch_name));
            match create_new_branch(&branch_name) {
                Ok(_) => {}
                Err(error) => {
                    match stash_pop() {
                        Ok(output) => {
                            sp.stop_with_symbol(&GLOBAL_DATA.cross_emoji);
                            println!("{}", style(output).dim().magenta());
                            print_error_and_exit(error.to_string());
                        }
                        Err(error) => {
                            sp.stop_with_symbol(&GLOBAL_DATA.cross_emoji);
                            print_error_and_exit(error.to_string());
                        }
                    };
                }
            };

            match stash_pop() {
                Ok(output) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.check_emoji);
                    println!("{}", style(output).dim());
                }
                Err(error) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.cross_emoji);
                    print_error_and_exit(error.to_string());
                }
            };

            let mut sp = spinner("Committing changes...".into());
            match add_and_commit_changes("initial commit") {
                Ok(output) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.check_emoji);
                    print_success_output(output)
                }
                Err(error) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.cross_emoji);
                    print_error_and_exit(error.to_string());
                }
            };
        }
        Some(("rb", sub_matches)) => {
            let branch_name = sub_matches
                .get_one::<String>("BRANCH_NAME")
                .expect("required");
            let mut sp = spinner(format!("Rebasing from {}", branch_name));

            match rebase_from_branch(branch_name) {
                Ok(output) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.check_emoji);
                    if output.len() > 0 {
                        print_success_output(output)
                    } else {
                        print_success_output(format!("Successfully rebased from {}", branch_name));
                    }
                }
                Err(error) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.cross_emoji);
                    print_error_and_exit(error.to_string())
                }
            };
        }
        Some(("add", _)) => {
            let mut sp = spinner("Fetching branch names from remote...".into());
            let (branches, current_branch) = get_remote_branches();

            sp.stop_with_symbol(&GLOBAL_DATA.check_emoji);

            println!(
                "\n{} {}{}\n",
                style("currently on").dim(),
                GLOBAL_DATA.arrow_emoji,
                style(current_branch).bright().cyan().bold()
            );

            let branch_name =
                cli::fuzzy_select(&branches, "search for a remote branch to checkout");

            match switch_to_branch(&branch_name) {
                Ok(output) => print_success_output(output),
                Err(error) => print_error_and_exit(error.to_string()),
            };
        }
        Some(("pff", _)) => {
            let mut sp = spinner("Pulling from remote...".into());

            match pull_fast_forward_only() {
                Ok(output) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.check_emoji);
                    print_success_output(output);
                }
                Err(error) => {
                    sp.stop_with_symbol(&GLOBAL_DATA.cross_emoji);
                    print_error_and_exit(error.to_string())
                }
            };
        }
        _ => print_error_and_exit(String::from("Not a valid subcommand")),
    }
}

fn init() -> Command {
    Command::new("gbm")
        .about("Simple utility for managing branches without having to type out the full name.")
        .arg_required_else_help(true)
        .subcommand_required(true)
        .subcommand(
            Command::new("switch")
                .about("Select a local branch to switch into.")
                .alias("sw"),
        )
        .subcommand(
            Command::new("remove")
                .about("Select a local branch to remove.")
                .alias("rm"),
        )
        .subcommand(
            Command::new("rb")
                .about("Rebase current branch off given remote branch.")
                .arg_required_else_help(true)
                .arg(arg!(<BRANCH_NAME> "Name of remote branch to rebase")),
        )
        .subcommand(
            Command::new("ct")
                .about("Takes all uncommitted changes to a specified branch.")
                .arg_required_else_help(true)
                .arg(arg!(<BRANCH_NAME> "Name of new branch to transfer changes to")),
        )
        .subcommand(
            Command::new("add").about("Filter through remote branches to select one to checkout."),
        )
        .subcommand(Command::new("pff").about("Fast forward pull from remote: git pull --ff-only"))
}
