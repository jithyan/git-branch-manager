use crate::util::print_error_and_exit;
use console::style;
use dialoguer::{theme::ColorfulTheme, FuzzySelect, Select};
use std::process;

pub fn select(items: Vec<String>, prompt: &str) -> String {
    let mut items = items;
    let styled_exit = style(String::from("Exit")).red().to_string();
    items.push(styled_exit.clone());

    let selected_item = match Select::with_theme(&ColorfulTheme::default())
        .with_prompt(prompt)
        .default(0)
        .items(&items[..])
        .interact()
    {
        Ok(i) => &items[i],
        Err(e) => print_error_and_exit(e.to_string()),
    };

    if selected_item.to_string() == String::from(styled_exit) {
        process::exit(0)
    }

    selected_item.clone()
}

pub fn fuzzy_select(branches: &Vec<String>, prompt: &str) -> String {
    match FuzzySelect::with_theme(&ColorfulTheme::default())
        .with_prompt(prompt)
        .default(0)
        .items(&branches[..])
        .max_length(6)
        .interact()
    {
        Ok(i) => branches[i].clone(),
        Err(e) => print_error_and_exit(e.to_string()),
    }
}
