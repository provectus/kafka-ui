# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the maintainers of the repository before making a change. 

Please note we have a code of conduct (`CODE-OF-CONDUCT.md`), please follow it in all your interactions with the project.

## Pull Request Process

### General rules

1. Ensure any install or build dependencies have been removed before the end of the layer when composing a 
   build.
2. Update the `README.md` with details of changes to the interface, this includes new environment 
   variables, exposed ports, useful file locations and container parameters.
3. Start a pull request name with issue number (ex. #123).
4. You may merge the pull request once you have the approval of two other developers. In case you 
   don't have permissions to do that, you may request the second reviewer to merge it for you.

### Branch naming

In order to keep branch names understandable and similar please use the corresponding branch naming conventions.

Generally speaking, it's a good idea to add a group/type prefix for a branch, e.g., 
if you're working on a specific branch you could name your branch `issues/xxx`. 

Here's a list of good examples:<br/>
`issues/123`<br/>
`feature/feature_name`<br/>
`bugfix/fix_thing`<br/>

### Code style

There's a file called `checkstyle.xml` in project root under `etc` directory.<br/>
You can import it into IntelliJ IDEA via checkstyle plugin. 

### Naming conventions

REST paths should be **lowercase** and consist of just **plural** nouns.<br/>
Also, multiple words in a single path segment should be divided by a hyphen symbol (`-`).<br/>

Query variable names should be formatted in `camelCase`.

Model names should consist of just **plural** nouns and should be formatted in `camelCase` as well.