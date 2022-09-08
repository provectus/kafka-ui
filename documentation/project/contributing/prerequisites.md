### Prerequisites

This page explains how to get the software you need to use a Linux or macOS
machine for local development. 

Before you begin contributing you must have:

* A GitHub account
* `Java` 13 or newer
* `Git`
* `Docker`

### Installing prerequisites on macOS
1. Install [brew](https://brew.sh/).
2. Install brew cask:
```sh
brew cask
``` 
3. Install JDK 13 via Homebrew cask:
```sh
brew tap adoptopenjdk/openjdk
brew install adoptopenjdk13
```
4. Verify Installation
```sh
java -version
```
Note : In case JAVA13 is not set as your default Java then you can consider to include JAVA13 in your PATH after installation
```sh
export PATH="/Library/Java/JavaVirtualMachines/adoptopenjdk-13.jdk/Contents/Home/bin:$PATH
```
## Tips

Consider allocating not less than 4GB of memory for your docker. 
Otherwise, some apps within a stack (e.g. `kafka-ui.yaml`) might crash.

## Where to go next

In the next section, you'll [learn how to Build and Run kafka-ui](building.md).
