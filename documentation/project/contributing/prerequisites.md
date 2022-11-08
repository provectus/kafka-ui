### Prerequisites

This page explains how to get the software you need to use a Linux or macOS
machine for local development.

Before you begin contributing you must have:

* A GitHub account
* `Java` 17 or newer
* `Git`
* `Docker`

### Installing prerequisites on macOS

1. Install [brew](https://brew.sh/).
2. Install brew cask:
```sh
brew cask
```
3. Install Eclipse Temurin 17 via Homebrew cask:
```sh
brew tap homebrew/cask-versions
brew install temurin17
```
4. Verify Installation
```sh
java -version
```
Note : In case OpenJDK 17 is not set as your default Java, you can consider to include it in your `$PATH` after installation
```sh
export PATH="$(/usr/libexec/java_home -v 17)/bin:$PATH"
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
```

## Tips

Consider allocating not less than 4GB of memory for your docker.
Otherwise, some apps within a stack (e.g. `kafka-ui.yaml`) might crash.

## Where to go next

In the next section, you'll [learn how to Build and Run kafka-ui](building.md).
