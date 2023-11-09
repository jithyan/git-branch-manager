use console::style;
use spinners::{Spinner, Spinners};
use std::process::{self, Command as StdCommand};
use std::str;

pub fn print_error_and_exit(error: String) -> ! {
    println!("\nError");
    eprintln!("{}", style(error).red());
    process::exit(1);
}

pub fn parse_command(command: &mut StdCommand) -> Result<String, String> {
    match command.output() {
        Ok(output) => {
            if output.status.success() {
                match str::from_utf8(&output.stdout) {
                    Ok(s) => Ok(s.to_string()),
                    Err(e) => Err(e.to_string()),
                }
            } else {
                match str::from_utf8(&output.stderr) {
                    Ok(s) => Err(s.to_string()),
                    Err(e) => Err(e.to_string()),
                }
            }
        }
        Err(e) => Err(e.to_string()),
    }
}

pub fn spinner(message: String) -> Spinner {
    Spinner::new(Spinners::Dots9, style(message).green().to_string())
}
