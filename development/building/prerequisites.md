# Prerequisites

### Prerequisites

This page explains how to get the software you need to use on Linux or macOS for local development.

* `java 17` package or newer
* `git` installed
* `docker` installed

> Note: For contribution, you must have a `github` account.

#### For Linux

1. Install `OpenJDK 17` package or newer:

```
sudo apt update
sudo apt install openjdk-17-jdk
```

* Check java version using the command `java -version`.

```
openjdk version "17.0.5" 2022-10-18
OpenJDK Runtime Environment (build 17.0.5+8-Ubuntu-2ubuntu120.04)
OpenJDK 64-Bit Server VM (build 17.0.5+8-Ubuntu-2ubuntu120.04, mixed mode, sharing)
```

Note: In case OpenJDK 17 is not set as your default Java, run `sudo update-alternatives --config java` command to list all installed Java versions.

```
Selection    Path                                            Priority   Status
------------------------------------------------------------
* 0            /usr/lib/jvm/java-11-openjdk-amd64/bin/java      1111      auto mode
  1            /usr/lib/jvm/java-11-openjdk-amd64/bin/java      1111      manual mode
  2            /usr/lib/jvm/java-16-openjdk-amd64/bin/java      1051      manual mode
  3            /usr/lib/jvm/java-17-openjdk-amd64/bin/java      1001      manual mode

Press <enter> to keep the current choice[*], or type selection number:
```

you can set it as the default by entering the selection number for it in the list and pressing Enter. For example, to set Java 17 as the default, you would enter "3" and press **Enter**.

2. Install `git`:

```
sudo apt install git
```

3. Install `docker`:

```
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository -y "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt-cache policy docker-ce
sudo apt -y install docker-ce
```

To execute the `docker` Command without `sudo`:

```
sudo usermod -aG docker ${USER}
su - ${USER}
sudo chmod 666 /var/run/docker.sock
```

#### For macOS

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

Note: In case OpenJDK 17 is not set as your default Java, you can consider including it in your `$PATH` after installation

```sh
export PATH="$(/usr/libexec/java_home -v 17)/bin:$PATH"
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
```

### Tips

Consider allocating not less than 4GB of memory for your docker. Otherwise, some apps within a stack (e.g. `kafka-ui.yaml`) might crash.

To check how much memory is allocated to docker, use `docker info`.

You will find the total memory and used memory in the output. if you won't find used memory that means memory limits are not set for containers.

**To allocate 4GB of memory for Docker:**

**MacOS**

Edit docker daemon settings within docker dashboard

**For Ubuntu**

1. Open the Docker configuration file in a text editor using the following command:

```
sudo nano /etc/default/docker
```

2. Add the following line to the file to allocate 4GB of memory to Docker:

```
DOCKER_OPTS="--default-ulimit memlock=-1:-1 --memory=4g --memory-swap=-1"
```

3. Save the file and exit the text editor.
4. Restart the Docker service using the following command:

```
sudo service docker restart
```

5. Verify that the memory limit has been set correctly by running the following command:

```
docker info | grep -i memory
```

Note that the warning messages are expected as they relate to the kernel not supporting cgroup memory limits.

Now any containers you run in docker will be limited to this amount of memory. You can also increase the memory limit as per your preference.

### Where to go next

In the next section, you'll learn how to Build and Run kafka-ui.
