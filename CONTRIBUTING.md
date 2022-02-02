The following guide is aimed at explaining the process of working on an issue(-s) and Pull Requests (PRs).

Completing some of the steps isn't possible by yourself if you don't have a write permission. Feel free to ask the maintainers to help you out with the unavailable actions.

# General recommendations

Please note we have a code of conduct (`CODE-OF-CONDUCT.md`), please follow it in all your interactions with the project.


# Issues

## Choosing an issue

Basically, there are two places to look up for the issues to contribute to. <br/>
The first one is our ["Up for grabs"](https://github.com/provectus/kafka-ui/projects/11) board, where issues are sorted by required experience level (beginner, intermediate, expert).

The second place is searching up for ["good first issue"](https://github.com/provectus/kafka-ui/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)-labeled issues. Some of them might not be present in the aforementioned board or vice versa.

The next thing to consider is labels. You can sort the issues by scope labels, like, `scope/backend`, `scope/frontend` or even `scope/k8s`. If the issue requires a few areas to work on, and you don't have a required expertise, still feel free to pick it and do your part, others will do the rest.

## Grabbing the issue

There is a bunch of criteria for an issue to be liable for development. <br/>
The implementation of the features and/or their enhancements should be reasonable, must be backed by justified requirements (demanded by community, [roadmap](documentation/project/ROADMAP.md) plans, etc.). Final decision is left for maintainers' discretion. <br/>
All the bugs should be confirmed as such (that the behavior is unintended).

The issue should be properly triaged by maintainers beforehand, which includes:
1. Having a proper milestone set
2. Having required labels assigned: accepted label, scope labels and others.

Formally, having the aforementioned triage conditions is enough to get started.

Having all these requirements present, feel free to pick the issue you want. Ask the maintainers in case of doubt.

## Working on the issue

Every issue which is being worked on has to be assigned to the corresponding person. <br/>
To keep the status of the issue clear, please keep the card' status actual ("project" card on the right side of the issue, should be the same as the milestone name).

## Setting up a local development environment

Please refer to [this guide](documentation/project/contributing/README.md).

# Pull Requests

## Branch naming

In order to keep branch names understandable and similar please use the corresponding branch naming conventions.

Generally speaking, it's a good idea to add a group/type prefix for a branch, e.g.,
if you're working on a specific branch you could name your branch `issues/xxx`.

Here's a list of good examples:<br/>
`issues/123`<br/>
`feature/feature_name`<br/>
`bugfix/fix_thing`<br/>

## Code style

Java: There's a file called `checkstyle.xml` in project root under `etc` directory.<br/>
You can import it into IntelliJ IDEA via checkstyle plugin.

## Naming conventions

REST paths should be **lowercase** and consist of just **plural** nouns.<br/>
Also, multiple words in a single path segment should be divided by a hyphen symbol (`-`).<br/>

Query variable names should be formatted in `camelCase`.

Model names should consist of just **plural** nouns and should be formatted in `camelCase` as well.

## Creating a PR

When creating a PR please do the following:
1. In commit messages use the [closing keywords](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).
2. Link an issue(-s) via "linked issues" block.
3. Set the PR labels. Just set the same set of labels present in the issue, ignoring yellow `status/` labels.
4. If the PR doesn't close any issue it might need to a milestone set on itself. Ask the maintainers.
5. Assign the PR to yourself. PR assignee is the person who's goal is to get the PR merged.
6. Add reviewers. Usually, reviewers suggestions are pretty good, use them.

### Pull Request checklist

1. Ensure any install or build dependencies have been removed before the end of the layer when composing a build.
2. Update the `README.md` with details of changes to the interface, this includes new environment
   variables, exposed ports, useful file locations and container parameters.

## Reviewing a PR

WIP

### Pull Request reviewer checklist

WIP
