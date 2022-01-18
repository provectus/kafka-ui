### Get the required software for Linux or macOS

This page explains how to get the software you need to use a Linux or macOS
machine for local development. Before you begin contributing you must have:

* a GitHub account
* Java 13 or newer
* `git`
* `docker`

### Installing prerequisites on macOS
1. Install [brew](https://brew.sh/).

2. Install brew cask:
```sh
> brew cask
``` 
3Install JDK 13 via Homebrew cask:
```sh
> brew tap adoptopenjdk/openjdk
> brew install adoptopenjdk13
```

## Tips

Consider allocating not less than 4GB of memory for your docker. 
Otherwise, some apps within a stack (e.g. `kafka-ui.yaml`) might crash.

## Where to go next

In the next section, you'll [learn how to build the application](building.md).
### GIT SETUP