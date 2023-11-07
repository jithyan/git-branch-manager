#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

mod cli;
mod git;
mod util;
use clap::{arg, Command};
use console::style;
use emoji_printer::print_emojis;
use git::get_remote_branches;
use spinners::{Spinner, Spinners};
use std::process::Command as StdCommand;
use util::{parse_command, print_error_and_exit};

#[napi]
pub fn cli(itr: Vec<String>) {
  match init().get_matches_from(itr).subcommand() {
    Some(("switch", _)) => {
      let (branches, current_branch): (Vec<String>, String) = git::get_local_branches();

      let arrow_emoji = style(print_emojis(":right_arrow: ")).green().bold();
      println!(
        "{} {}{}",
        style("currently on").dim(),
        arrow_emoji,
        style(current_branch).cyan().bold()
      );

      let selected_branch = cli::select(branches, "select a branch to switch to");

      match parse_command(StdCommand::new("git").arg("checkout").arg(selected_branch)) {
        Ok(output) => {
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => print_error_and_exit(error.to_string()),
      }
    }
    Some(("remove", _)) => {
      let (branches, current_branch): (Vec<String>, String) = git::get_local_branches();
      let branches: Vec<String> = branches
        .iter()
        .filter(|&b| !b.eq(&current_branch))
        .map(|b| b.into())
        .collect();
      let selected_branch = cli::select(branches, "select a branch to remove");

      match parse_command(
        StdCommand::new("git")
          .arg("branch")
          .arg("-D")
          .arg(selected_branch),
      ) {
        Ok(output) => {
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => print_error_and_exit(error.to_string()),
      }
    }
    Some(("ct", sub_matches)) => {
      let branch_name = sub_matches
        .get_one::<String>("BRANCH_NAME")
        .expect("required");

      match parse_command(StdCommand::new("git").arg("add").arg(".")) {
        Ok(output) => {
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => print_error_and_exit(error.to_string()),
      };
      match parse_command(StdCommand::new("git").arg("stash")) {
        Ok(output) => {
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => print_error_and_exit(error.to_string()),
      };
      match parse_command(
        StdCommand::new("git")
          .arg("checkout")
          .arg("-b")
          .arg(branch_name),
      ) {
        Ok(output) => {
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => {
          match parse_command(StdCommand::new("git").arg("stash").arg("pop")) {
            Ok(output) => {
              println!("{}", style(output).cyan().bold());
              print_error_and_exit(error.to_string());
            }
            Err(error) => print_error_and_exit(error.to_string()),
          };
        }
      };
      match parse_command(StdCommand::new("git").arg("stash").arg("pop")) {
        Ok(output) => {
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => print_error_and_exit(error.to_string()),
      };
      match parse_command(
        StdCommand::new("git")
          .arg("commit")
          .arg("-am")
          .arg("initial commit"),
      ) {
        Ok(output) => {
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => print_error_and_exit(error.to_string()),
      };
    }
    Some(("rb", sub_matches)) => {
      let branch_name = sub_matches
        .get_one::<String>("BRANCH_NAME")
        .expect("required");
      let mut sp = Spinner::new(
        Spinners::Dots9,
        format!("Rebasing from {}", branch_name).into(),
      );
      match parse_command(
        StdCommand::new("git")
          .arg("pull")
          .arg("origin")
          .arg(branch_name)
          .arg("-r"),
      ) {
        Ok(output) => {
          sp.stop();
          println!("");
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => {
          sp.stop();
          println!("");
          print_error_and_exit(error.to_string())
        }
      };
    }
    Some(("add", _)) => {
      let mut sp = Spinner::new(
        Spinners::Dots9,
        "Fetching branch names from remote...".into(),
      );
      let branches = get_remote_branches();
      sp.stop();
      println!("");
      println!("");
      let branch_name = cli::fuzzy_select(&branches, "search for a remote branch to checkout");

      match parse_command(StdCommand::new("git").arg("checkout").arg(branch_name)) {
        Ok(output) => {
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => print_error_and_exit(error.to_string()),
      };
    }
    Some(("pff", _)) => {
      let mut sp = Spinner::new(Spinners::Dots9, "Pulling from remote...".into());
      match parse_command(StdCommand::new("git").arg("pull").arg("--ff-only")) {
        Ok(output) => {
          sp.stop();
          println!("");
          println!("{}", style(output).cyan().bold());
        }
        Err(error) => {
          sp.stop();
          println!("");
          print_error_and_exit(error.to_string())
        }
      };
    }
    _ => print_error_and_exit(String::from("Not a valid subcommand")),
  }
}

fn init() -> Command {
  Command::new("gbm")
    .no_binary_name(true)
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
