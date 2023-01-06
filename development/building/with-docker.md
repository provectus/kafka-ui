# With Docker

## Build & Run

Once you installed the prerequisites and cloned the repository, run the following steps in your project directory:

### Step 1 : Build

> _**NOTE:**_ If you are an macOS M1 User then please keep in mind below things

> Make sure you have ARM supported java installed

> Skip the maven tests as they might not be successful

* Build a docker image with the app

```
./mvnw clean install -Pprod
```

* if you need to build the frontend `kafka-ui-react-app`, go here
  * kafka-ui-react-app-build-documentation
* In case you want to build `kafka-ui-api` by skipping the tests

```
./mvnw clean install -Dmaven.test.skip=true -Pprod
```

* To build only the `kafka-ui-api` you can use this command:

```
./mvnw -f kafka-ui-api/pom.xml clean install -Pprod -DskipUIBuild=true
```

If this step is successful, it should create a docker image named `provectuslabs/kafka-ui` with `latest` tag on your local machine except macOS M1.

### Step 2 : Run

**Using Docker Compose**

> _**NOTE:**_ If you are an macOS M1 User then you can use arm64 supported docker compose script `./documentation/compose/kafka-ui-arm64.yaml`

* Start the `kafka-ui` app using docker image built in step 1 along with Kafka clusters:

```
docker-compose -f ./documentation/compose/kafka-ui.yaml up -d
```

**Using Spring Boot Run**

* If you want to start only kafka clusters (to run the `kafka-ui` app via `spring-boot:run`):

```
docker-compose -f ./documentation/compose/kafka-clusters-only.yaml up -d
```

* Then start the app.

```
./mvnw spring-boot:run -Pprod

# or

./mvnw spring-boot:run -Pprod -Dspring.config.location=file:///path/to/conf.yaml
```

**Running in kubernetes**

* Using Helm Charts

```
helm repo add kafka-ui https://provectus.github.io/kafka-ui
helm install kafka-ui kafka-ui/kafka-ui
```

To read more please follow to chart documentation.

### Step 3 : Access Kafka-UI

* To see the `kafka-ui` app running, navigate to http://localhost:8080.
