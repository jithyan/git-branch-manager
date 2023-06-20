# git-branch-manager

Simple CLI to avoid typing out full git branch names for switching or deleting branches.

## Get started

> This will only will work with Node 16 and above

```bash
npm install -g @jithyan/git-branch-manager
```

Now you can run it by calling `gbm`.

> If you run into trouble running `yarn` in a corporate proxy, you will have to update `.yarnrc.yml` to add ca-certs and proxy config. See the [yarn docs for more info](https://yarnpkg.com/configuration/yarnrc).

## How to use

1. `cd` into a `git` repo.
2. Run `gbm <command>`

### Available commands

#### switch

Allows you to select a branch that is checked out locally to switch to. Equivalent to running `git checkout <selected_branch_name>`.

Example:

`gbm switch`

![switch example](./img/switch.png)

#### remove

Allows you to select a branch that is checked out locally to remove. Equivalent to running `git branch -D <selected_branch_name>`.

Example:

`gbm remove`

![remove example](./img/remove.png)

#### add (takes 1 extra string argument, to filter remote branches)

Allows you to filter branches from remote and select a branch to checkout locally. Equivalent to running `git checkout <selected_branch_name>`.
**Note:** The filter argument is a string, not a regular expression.

Example:

`gbm add fix`

![add example](./img/add.png)

#### stash

Allows you to select and apply a stash. Equivalent to running `git stash apply <stash_name>`.

Example:

`gbm stash`

![stash example](./img/stash.png)
