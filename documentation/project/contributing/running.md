# Running the app

### Running locally via docker
If you have built a container locally or wish to run a public one you could bring everything up like this:
```shell
docker-compose -f documentation/compose/kafka-ui.yaml up -d
```

### Running locally without docker
Once you built the app, run the following in `kafka-ui-api/`:

```sh
./mvnw spring-boot:run -Pprod

# or

./mvnw spring-boot:run -Pprod -Dspring.config.location=file:///path/to/conf.yaml
```

### Running in kubernetes
``` bash
helm repo add kafka-ui https://provectus.github.io/kafka-ui
helm install kafka-ui kafka-ui/kafka-ui
```
To read more please follow to [chart documentation](../../../charts/kafka-ui/README.md)
