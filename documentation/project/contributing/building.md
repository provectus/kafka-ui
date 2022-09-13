# Build & Run

Once you installed the prerequisites and cloned the repository, run the following steps in your project directory:

## Step 1 : Build
> **_NOTE:_**  If you are an macOS M1 User then please keep in mind below things

> Make sure you have ARM supported java installed

> Skip the maven tests as they might not be successful

> Comment out `com.spotify` plugin in `kafka-ui-api` pom file

> Once your build is successful you need to create docker image manually as you'd commented `com.spotify` plugin

> ```docker build --platform linux/arm64 -t provectuslabs/kafka-ui:latest --build-arg JAR_FILE=kafka-ui-api-0.0.1-SNAPSHOT.jar .```


- if you need to build the frontend `kafka-ui-react-app`, go here
     - [kafka-ui-react-app-build-documentation](../../../kafka-ui-react-app/README.md)

- Build a docker image with the app
```sh
./mvnw clean install -Pprod
```

- In case you want to build `kafka-ui-api` by skipping the tests
```sh
./mvnw clean install -Dmaven.test.skip=true -Pprod
``` 

- To build only the `kafka-ui-api` you can use this command:
```sh
./mvnw -f kafka-ui-api/pom.xml clean install -Pprod -DskipUIBuild=true
```

If this step is successful, it should create a docker image named `provectuslabs/kafka-ui` with `latest` tag on your local machine except macOS M1.

## Step 2 : Run
#### Using Docker Compose
> **_NOTE:_**  If you are an macOS M1 User then you can use arm64 supported docker compose script `./documentation/compose/kafka-ui-arm64.yaml`
 - Start the `kafka-ui` app using docker image built in step 1 along with Kafka clusters:
```sh
docker-compose -f ./documentation/compose/kafka-ui.yaml up -d
```

#### Using Spring Boot Run
 - If you want to start only kafka clusters (to run the `kafka-ui` app via `spring-boot:run`):
```sh
docker-compose -f ./documentation/compose/kafka-clusters-only.yaml up -d
``` 
- Then start the app.
```sh
./mvnw spring-boot:run -Pprod

# or

./mvnw spring-boot:run -Pprod -Dspring.config.location=file:///path/to/conf.yaml
```

#### Running in kubernetes
- Using Helm Charts
```sh bash
helm repo add kafka-ui https://provectus.github.io/kafka-ui
helm install kafka-ui kafka-ui/kafka-ui
```
To read more please follow to [chart documentation](../../../charts/kafka-ui/README.md).
 
## Step 4 : Access Kafka-UI
 - To see the `kafka-ui` app running, navigate to http://localhost:8080.