# Clear Street Proto with Buf

## Goal

At Clear Street, protobuf on Kafka is enabled with some special Kafka Headers or topic names.
We've added [Buf](https://buf.build/) support to Kafka UI, as well as special deserialization logic.

Use the [Protobuf on Kafka](https://www.notion.so/clearstreet/Protobuf-on-Kafka-ac912401cf504c75956d907b86a12f55) to reference the format.

## Settings

Use these settings to set up the Buf connection:

```yaml
bufRegistry: https://<url>
bufUsername: <user>
bufApiToken: <token>
```

## Running the application locally

### Initial setup

**These steps only need to be run once, when you download the project.**

1. Start the Kafka cluster in the background. It can remain up indefinitely.

```bash
docker-compose -f ./documentation/compose/kafka-clusters-only.yaml up -d
```

2. Generate necessary Java code with:

```bash
./mvnw clean install -Pprod
```

### Development loop

After editing Java code, run:

```bash
# in kafka-ui-api dir
 ./mvnw spring-boot:run -Pprod -Dspring-boot.run.arguments=--spring.config.location=file:///home/ohartman/git/kafka-ui/kafka-ui-api/src/main/resources/application-local-buf.yml
```

### Compilation Errors

If you run into spurious compilation errors which are not from your new code, you may need to re-compile everything:

```bash
# save work
git commit -am "save"
# clean generated files
git clean -xdf
```

Then re-run step 2 of Initial Setup.

## Implementation

We add `BufAndSchemaRegistryAwareRecordSerDe`, which can do both Buf- and SchemaRegistry-aware deserialization of Kafka messages.

The `BufClient` manages connection to Buf registry.

The `// clst specific` comment should help with merging with upstream.
