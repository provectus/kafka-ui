### Building the application locally

Once you installed the prerequisites and cloned the repository, run the following commands in your project directory:

Build a docker container with the app:
```sh
./mvnw clean install -Pprod
``` 
Start the app with Kafka clusters:
```sh
docker-compose -f ./documentation/compose/kafka-ui.yaml up -d
``` 
To see the app, navigate to http://localhost:8080.

If you want to start only kafka clusters (to run the app via `spring-boot:run`):
```sh
docker-compose -f ./documentation/compose/kafka-clusters-only.yaml up -d
``` 

Then, start the app.

## Where to go next

In the next section, you'll [learn how to run the application](running.md).