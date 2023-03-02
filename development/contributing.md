# Contributing

This guide aims to walk you through the process of working on issues and Pull Requests (PRs).

Bear in mind that you will not be able to complete some steps on your own if you do not have “write” permission. Feel free to reach out to the maintainers to help you unlock these activities.

## General recommendations

Please note that we have a [code of conduct](../project/code-of-conduct.md). Make sure that you follow it in all of your interactions with the project.

## Issues

### Choosing an issue

There are two options to look for the issues to contribute to.\
The first is our ["Up for grabs"](https://github.com/provectus/kafka-ui/projects/11) board. There the issues are sorted by the required experience level (beginner, intermediate, expert).

The second option is to search for ["good first issue"](https://github.com/provectus/kafka-ui/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)-labeled issues. Some of them might not be displayed on the aforementioned board or vice versa.

You also need to consider labels. You can sort the issues by scope labels, such as `scope/backend`, `scope/frontend` or even `scope/k8s`. If any issue covers several specific areas, and you do not have the required expertise for one of them, just do your part of the work — others will do the rest.

### Grabbing the issue

There is a bunch of criteria that make an issue feasible for development.\
The implementation of any features and/or their enhancements should be reasonable and must be backed by justified requirements (demanded by the community, roadmap plans, etc.). The final decision is left to the maintainers' discretion.

All bugs should be confirmed as such (i.e. the behavior is unintended).

Any issue should be properly triaged by the maintainers beforehand, which includes:

1. Having a proper milestone set
2. Having required labels assigned: "accepted" label, scope labels, etc.

Formally, if these triage conditions are met, you can start to work on the issue.

With all these requirements met, feel free to pick the issue you want. Reach out to the maintainers if you have any questions.

### Working on the issue

Every issue “in progress” needs to be assigned to a corresponding person. To keep the status of the issue clear to everyone, please keep the card's status updated ("project" card to the right of the issue should match the milestone’s name).

### Setting up a local development environment

Please refer to this guide.

## Pull Requests

### Branch naming

In order to keep branch names uniform and easy to understand, please use the following conventions for branch naming.

Generally speaking, it is a good idea to add a group/type prefix to a branch; e.g., if you are working on a specific branch, you could name it `issues/xxx`.

Here is a list of good examples:\
`issues/123`\
`feature/feature_name`\
`bugfix/fix_thing`\


### Code style

Java: There is a file called `checkstyle.xml` in project root under `etc` directory.\
You can import it into IntelliJ IDEA via Checkstyle plugin.

### Naming conventions

REST paths should be written in **lowercase** and consist of **plural** nouns only.\
Also, multiple words that are placed in a single path segment should be divided by a hyphen (`-`).\


Query variable names should be formatted in `camelCase`.

Model names should consist of **plural** nouns only and should be formatted in `camelCase` as well.

### Creating a PR

When creating a PR please do the following:

1. In commit messages use these [closing keywords](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).
2. Link an issue(-s) via "linked issues" block.
3. Set the PR labels. Ensure that you set only the same set of labels that is present in the issue, and ignore yellow `status/` labels.
4. If the PR does not close any of the issues, the PR itself might need to have a milestone set. Reach out to the maintainers to consult.
5. Assign the PR to yourself. A PR assignee is someone whose goal is to get the PR merged.
6. Add reviewers. As a rule, reviewers' suggestions are pretty good; please use them.
7. Upon merging the PR, please use a meaningful commit message, the task name should be fine in this case.

#### Pull Request checklist

1. When composing a build, ensure that any install or build dependencies have been removed before the end of the layer.
2. Update the `README.md` with the details of changes made to the interface. This includes new environment variables, exposed ports, useful file locations, and container parameters.

### Reviewing a PR

WIP

#### Pull Request reviewer checklist

WIP
